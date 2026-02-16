import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRoleDto } from "../../dto/roles/create-role.dto";
import { UpdateRoleDto } from "../../dto/roles/update-role.dto";
import { SearchRolesDto } from "../../dto/roles/search-roles.dto";
import { Prisma } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const newRole = await this.prisma.role.create({
      data: createRoleDto,
    });
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'roles'`);
    await this.cacheManager.del('roles'); // Invalidate the cache for all roles
    return newRole;
  }

  async findAll(searchDto: SearchRolesDto) {
    const cacheKey = `roles_${JSON.stringify(searchDto)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedRoles = await this.cacheManager.get(cacheKey);

    if (cachedRoles) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return cachedRoles;
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { search, sortBy, sortOrder, page, limit } = searchDto;

    const skip = (page - 1) * limit;

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
        take: Number(limit),
        orderBy,
      }),
      this.prisma.role.count({ where }),
    ]);

    const result = {
      roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.cacheManager.set(cacheKey, result);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `role_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedRole = await this.cacheManager.get(cacheKey);

    if (cachedRole) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return cachedRole;
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.cacheManager.set(cacheKey, role);
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
    await this.cacheManager.del(`role_${id}`); // Invalidate single role cache
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'roles'`);
    await this.cacheManager.del('roles'); // Invalidate all roles cache
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
    await this.cacheManager.del(`role_${id}`); // Invalidate single role cache
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'roles'`);
    await this.cacheManager.del('roles'); // Invalidate all roles cache
    return role;
  }
}
