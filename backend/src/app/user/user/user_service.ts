import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Inject, BadRequestException } from "@nestjs/common";
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateUserDto, SearchUsersDto } from "../../../dto/user.dto";
import { CreateUserDto } from "../../../dto/create-user.dto"; // Import CreateUserDto
import * as bcrypt from 'bcrypt'; // Import bcrypt
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  
  async getUserInfo(userId: number) {
    const cacheKey = `user_${userId}`;
    const cachedUser = await this.cacheManager.get(cacheKey);

    if (cachedUser) {
      return cachedUser;
    }

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
    await this.cacheManager.set(cacheKey, safeUser);
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
        updatedAt: new Date(),
      },
      include: {
        comments: {
          include: {
            // Removed Product: true, Shops: true as they are not valid relations for comments
          }
        },
        role: true, // Assuming Role is a direct relation as per schema.prisma
      },
    });

    const { password, ...safeUser } = user;
    await this.cacheManager.del(`user_${userId}`); // Invalidate cache
    return safeUser;
  }

  async deleteUser(userId: number) {
    await this.prisma.user.delete({
      where: { id: userId },
    });
    await this.cacheManager.del(`user_${userId}`); // Invalidate cache

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

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getAllUsers(searchDto: SearchUsersDto) {
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
        take: Number( limit),
        orderBy,
        include: {
          role: true, // Include role for searching and for response
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Убираем пароли из всех пользователей
    const safeUsers = users.map(({ password, ...user }) => user);

    return {
      users: safeUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}