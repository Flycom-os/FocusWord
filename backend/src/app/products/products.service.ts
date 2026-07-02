import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  async create(data: { name: string; slug: string; description?: string; price: number; categoryId?: number; status?: string }) {
    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: Number(data.price),
        categoryId: data.categoryId ? Number(data.categoryId) : null,
        status: data.status || 'active',
      },
    });

    await this.invalidateCache();
    return product;
  }

  async findAll(query: { page?: number; limit?: number; search?: string; categoryId?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const search = query.search || '';
    const categoryId = query.categoryId ? Number(query.categoryId) : undefined;

    const cacheKey = `products_${page}_${limit}_${search}_${categoryId}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cached);
    }

    const skip = (page - 1) * limit;
    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { category: true, reviews: true },
      }),
      this.prisma.product.count({ where }),
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
    const cacheKey = `product_${id}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, reviews: { orderBy: { createdAt: 'desc' } } },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await this.redisClient.set(cacheKey, JSON.stringify(product), 'EX', 3600);
    return product;
  }

  async findBySlug(slug: string) {
    const cacheKey = `product_slug_${slug}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, reviews: { orderBy: { createdAt: 'desc' } } },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    await this.redisClient.set(cacheKey, JSON.stringify(product), 'EX', 3600);
    return product;
  }

  async update(id: number, data: { name?: string; slug?: string; description?: string; price?: number; categoryId?: number; status?: string }) {
    const updateData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      status: data.status,
    };

    if (data.price !== undefined) {
      updateData.price = Number(data.price);
    }
    if (data.categoryId !== undefined) {
      updateData.categoryId = data.categoryId ? Number(data.categoryId) : null;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
    });

    await this.invalidateCache();
    await this.redisClient.del(`product_${id}`);
    if (product.slug) {
      await this.redisClient.del(`product_slug_${product.slug}`);
    }
    return product;
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (product) {
      // First delete reviews
      await this.prisma.productReview.deleteMany({
        where: { productId: id },
      });
      await this.prisma.product.delete({
        where: { id },
      });
      await this.redisClient.del(`product_${id}`);
      await this.redisClient.del(`product_slug_${product.slug}`);
    }
    await this.invalidateCache();
  }

  // === REVIEWS ===
  async addReview(productId: number, data: { name: string; email: string; message: string; rating: number }) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    const review = await this.prisma.productReview.create({
      data: {
        productId,
        name: data.name,
        email: data.email,
        message: data.message,
        rating: Number(data.rating),
      },
    });

    // Invalidate caches
    await this.redisClient.del(`product_${productId}`);
    await this.redisClient.del(`product_slug_${product.slug}`);
    await this.invalidateCache();

    return review;
  }

  async getReviews(productId: number) {
    return this.prisma.productReview.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async invalidateCache() {
    this.logger.log(`[INVALIDATE] Invalidating products caches`);
    const keys = await this.redisClient.keys('products_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }
}
