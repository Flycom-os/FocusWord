import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Inject, BadRequestException, Logger } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateUserDto, SearchUsersDto } from "../../../dto/user.dto";
import { CreateUserDto } from "../../../dto/create-user.dto"; // Import CreateUserDto
import * as bcrypt from 'bcrypt'; // Import bcrypt
import { Cache } from 'cache-manager'; // Keep Cache import for type if needed, but won't be used for injection
import { Prisma } from '@prisma/client';
import { REDIS_CLIENT } from '../../../redis/redis.module'; // Import our custom REDIS_CLIENT token
import IORedis from 'ioredis'; // Import IORedis for type hinting

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis, // Inject our custom Redis client
  ) {
    // This log is no longer relevant for the in-memory cache, but will remain for clarity on the change
    this.logger.log('UserService is now using direct IORedis client.');
  }
  
  async getUserInfo(userId: number) {
    const cacheKey = `user_${userId}`;
    this.logger.log(`[GET] Checking Redis for key: ${cacheKey}`);
    const cachedUser = await this.redisClient.get(cacheKey);

    if (cachedUser) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedUser); // Parse the stored string back to an object
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        comments: {
          include: {
          }
        },
        role: true,
      },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const { password, ...safeUser } = user;
    this.logger.log(`[SET] Setting Redis cache for key: ${cacheKey}`);
    // Stringify the object before storing, and set a TTL (e.g., 3600 seconds)
    await this.redisClient.set(cacheKey, JSON.stringify(safeUser), 'EX', 3600);
    return safeUser;
  }

  async updateUser(userId: number, dto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: dto.email,
        password: dto.password,
        firstName: dto.firstName,
        lastName: dto.lastName,
        avatarUrl: dto.avatarUrl,
        updatedAt: new Date(),
      },
      include: {
        comments: {
          include: {
          }
        },
        role: true, // Assuming Role is a direct relation as per schema.prisma
      },
    });

    const { password, ...safeUser } = user;
    this.logger.log(`[INVALIDATE] Deleting Redis cache for key: user_${userId}`);
    await this.redisClient.del(`user_${userId}`); // Invalidate cache
    this.logger.log(`[INVALIDATE] Deleting Redis cache for key: users`);
    await this.redisClient.del('users');
    return safeUser;
  }

  async deleteUser(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    this.logger.log(`[INVALIDATE] Deleting Redis cache for key: user_${userId}`);
    await this.redisClient.del(`user_${userId}`); // Invalidate cache
    this.logger.log(`[INVALIDATE] Deleting Redis cache for key: users`);
    await this.redisClient.del('users');

    return { message: 'Пользователь успешно удалён' };
  }

  async createUser(dto: CreateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Email is already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let roleId: number | undefined;
    if (dto.roleName) {
      const role = await this.prisma.role.findUnique({
        where: { name: dto.roleName },
      });
      if (!role) {
        throw new NotFoundException(`Role with name ${dto.roleName} not found`);
      }
      roleId = role.id;
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        roleId: roleId,
      },
      include: {
        role: true,
      },
    });
    this.logger.log(`[INVALIDATE] Deleting Redis cache for key: users`);
    await this.redisClient.del('users');

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(searchDto: SearchUsersDto) {
    const cacheKey = `users_${JSON.stringify(searchDto)}`;
    this.logger.log(`[GET] Checking Redis cache for key: ${cacheKey}`);
    const cachedUsers = await this.redisClient.get(cacheKey);

    if (cachedUsers) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedUsers); // Parse the stored string back to an object
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { search, sortBy, sortOrder, page, limit } = searchDto;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        {
          role: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    const orderBy: Prisma.UserOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' }; // Default sort

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          role: true, // Include role for searching and for response
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Убираем пароли из всех пользователей
    const safeUsers = users.map(({ password, ...user }) => user);

    const result = {
      users: safeUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    this.logger.log(`[SET] Setting Redis cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600); // Stringify and set TTL
    return result;
  }
}