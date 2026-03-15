import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePageDto } from "../dto/pages/create-page.dto";
import { PageFilterDto } from "../dto/pages/page-filter.dto";
import { UpdatePageDto } from "../dto/pages/update-page.dto";
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";
import { Prisma, Page } from '@prisma/client';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const { metaKeywords, ...rest } = createPageDto;
    const newPage = await this.prisma.page.create({
      data: {
        ...rest,
        metaKeywords: metaKeywords || [], // Ensure metaKeywords is an array
      },
    });
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'pages'`);
    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return newPage;
  }

  async findAll(filterDto: PageFilterDto): Promise<Page[]> {
    const cacheKey = `pages_${JSON.stringify(filterDto)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedPages = await this.redisClient.get(cacheKey);

    if (cachedPages) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedPages);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { search, status, authorId, page = 1, limit = 10 } = filterDto;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PageWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }
    if (authorId) {
      where.authorId = authorId;
    }

    const pages = await this.prisma.page.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(pages), 'EX', 3600);
    return pages;
  }

  async findOne(id: number): Promise<Page | null> {
    const cacheKey = `page_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedPage = await this.redisClient.get(cacheKey);

    if (cachedPage) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedPage);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const page = await this.prisma.page.findUnique({ where: { id } });

    if (page) {
      this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
      await this.redisClient.set(cacheKey, JSON.stringify(page), 'EX', 3600);
    }

    return page;
  }

  async findOneBySlug(slug: string): Promise<Page | null> {
    const cacheKey = `page_slug_${slug}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedPage = await this.redisClient.get(cacheKey);

    if (cachedPage) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedPage);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const page = await this.prisma.page.findUnique({ where: { slug } });

    if (page) {
      this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
      await this.redisClient.set(cacheKey, JSON.stringify(page), 'EX', 3600);
    }

    return page;
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const existingPage = await this.prisma.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found.`);
    }

    const { metaKeywords, publishedAt, ...rest } = updatePageDto;

    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: {
        ...rest,
        ...(metaKeywords && { metaKeywords }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        updatedAt: new Date(),
      },
    });

    this.logger.log(`[INVALIDATE] Deleting cache for key: page_${id}`);
    await this.redisClient.del(`page_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: page_slug_${existingPage.slug}`);
    await this.redisClient.del(`page_slug_${existingPage.slug}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'pages'`);
    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }

    return updatedPage;
  }

  async remove(id: number): Promise<void> {
    const existingPage = await this.prisma.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found.`);
    }
    await this.prisma.page.delete({ where: { id } });

    this.logger.log(`[INVALIDATE] Deleting cache for key: page_${id}`);
    await this.redisClient.del(`page_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: page_slug_${existingPage.slug}`);
    await this.redisClient.del(`page_slug_${existingPage.slug}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'pages'`);
    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
  }

  async publish(id: number): Promise<Page> {
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    this.logger.log(`[INVALIDATE] Deleting cache for key: page_${id}`);
    await this.redisClient.del(`page_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: page_slug_${updatedPage.slug}`);
    await this.redisClient.del(`page_slug_${updatedPage.slug}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'pages'`);
    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return updatedPage;
  }

  async unpublish(id: number): Promise<Page> {
    const updatedPage = await this.prisma.page.update({
      where: { id },
      data: {
        status: 'draft',
        publishedAt: null,
        updatedAt: new Date(),
      },
    });
    this.logger.log(`[INVALIDATE] Deleting cache for key: page_${id}`);
    await this.redisClient.del(`page_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: page_slug_${updatedPage.slug}`);
    await this.redisClient.del(`page_slug_${updatedPage.slug}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'pages'`);
    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return updatedPage;
  }
}
