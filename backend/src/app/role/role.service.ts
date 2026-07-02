import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoleDto } from "../../dto/roles/create-role.dto";
import { UpdateRoleDto } from "../../dto/roles/update-role.dto";
import { SearchRolesDto } from "../../dto/roles/search-roles.dto";
import { Prisma } from '@prisma/client';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = await this.prisma.role.create({
      data: createRoleDto,
    });
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'roles'`);
    const keys = await this.redisClient.keys('roles_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return newRole;
  }

  async findAll(searchDto: SearchRolesDto) {
    const cacheKey = `roles_${JSON.stringify(searchDto)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedRoles = await this.redisClient.get(cacheKey);

    if (cachedRoles) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedRoles);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { search, sortBy, sortOrder } = searchDto;
    
    // Use default values if not provided (inherited from SearchQueryDto)
    const currentPage = searchDto.page || 1;
    const currentLimit = searchDto.limit || 10;

    const skip = (currentPage - 1) * currentLimit;

    const where: Prisma.RoleWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.RoleOrderByWithRelationInput = sortBy
      ? { [sortBy]: sortOrder }
      : { createdAt: 'desc' }; // Default sort

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: Number(currentLimit),
        orderBy,
      }),
      this.prisma.role.count({ where }),
    ]);

    const result = {
      roles,
      total,
      page: currentPage,
      limit: currentLimit,
      totalPages: Math.ceil(total / currentLimit),
    };
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `role_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedRole = await this.redisClient.get(cacheKey);

    if (cachedRole) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedRole);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(role), 'EX', 3600);
    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: role_${id}`);
    await this.redisClient.del(`role_${id}`); // Invalidate single role cache
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'roles'`);
    const keys = await this.redisClient.keys('roles_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return role;
  }

  async remove(id: number) {
    const role = await this.prisma.role.delete({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: role_${id}`);
    await this.redisClient.del(`role_${id}`); // Invalidate single role cache
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'roles'`);
    const keys = await this.redisClient.keys('roles_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return role;
  }
}
