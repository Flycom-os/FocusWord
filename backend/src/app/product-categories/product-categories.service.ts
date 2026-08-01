import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';

@Injectable()
export class ProductCategoriesService {
  private readonly logger = new Logger(ProductCategoriesService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    parentId?: number;
    status?: string;
  }) {
    const category = await this.prisma.productCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        status: data.status || 'active',
      },
    });

    await this.invalidateCache();
    return category;
  }

  async findAll(query: { page?: number; limit?: number; search?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || '';

    const cacheKey = `product_categories_${page}_${limit}_${search}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;
    const where: Prisma.ProductCategoryWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.productCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { parent: true },
      }),
      this.prisma.productCategory.count({ where }),
    ]);

    const result = {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findOne(id: number) {
    const cacheKey = `product_category_${id}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const category = await this.prisma.productCategory.findUnique({
      where: { id },
      include: { parent: true, children: true },
    });

    if (!category) {
      throw new NotFoundException(`Product category with ID ${id} not found`);
    }

    await this.redisClient.set(cacheKey, JSON.stringify(category), 'EX', 3600);
    return category;
  }

  async update(
    id: number,
    data: {
      name?: string;
      slug?: string;
      description?: string;
      parentId?: number;
      status?: string;
    },
  ) {
    const category = await this.prisma.productCategory.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        parentId: data.parentId,
        status: data.status,
      },
    });

    await this.invalidateCache();
    await this.redisClient.del(`product_category_${id}`);
    return category;
  }

  async remove(id: number) {
    await this.prisma.productCategory.delete({
      where: { id },
    });

    await this.invalidateCache();
    await this.redisClient.del(`product_category_${id}`);
  }

  private async invalidateCache() {
    this.logger.log(`[INVALIDATE] Invalidating product category caches`);
    const keys = await this.redisClient.keys('product_categories_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }
}
