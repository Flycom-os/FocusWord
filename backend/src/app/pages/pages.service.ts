import { Injectable, NotFoundException, Inject, Logger, BadRequestException, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePageDto } from "../dto/pages/create-page.dto";
import { CreatePageDraftDto } from "../dto/pages/create-page-draft.dto";
import { PageFilterDto } from "../dto/pages/page-filter.dto";
import { UpdatePageDto } from "../dto/pages/update-page.dto";
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";
import { Prisma, Page } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class PagesService {
  private readonly logger = new Logger(PagesService.name);

  constructor(
    private prisma: PrismaService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  private readKeyFromEnvFile(): string | undefined {
    const candidates = [
      resolve(process.cwd(), '.env'),
      resolve(process.cwd(), '../.env'),
      resolve(__dirname, '../../../../.env'),
    ];

    for (const filePath of candidates) {
      if (!existsSync(filePath)) continue;
      const content = readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        if (trimmed.startsWith('DEEPSEEK_API_KEY=')) {
          return trimmed.slice('DEEPSEEK_API_KEY='.length).trim();
        }
        if (trimmed.startsWith('NEXT_PUBLIC_DEEPSEEK_API_KEY=')) {
          return trimmed.slice('NEXT_PUBLIC_DEEPSEEK_API_KEY='.length).trim();
        }
      }
    }

    return undefined;
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    const normalized = (base || 'new-page')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const baseSlug = normalized || `page-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;

    while (await this.prisma.page.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const data: Prisma.PageCreateInput = {
      title: createPageDto.title,
      slug: createPageDto.slug,
      content: createPageDto.content,
      status: createPageDto.status || 'draft',
      template: createPageDto.template || 'default', 
      seoTitle: createPageDto.seoTitle,
      seoDescription: createPageDto.seoDescription,
      metaKeywords: createPageDto.metaKeywords || [],
      contentBlocks: createPageDto.contentBlocks === null || createPageDto.contentBlocks === undefined ? [] : createPageDto.contentBlocks,

      author: createPageDto.authorId ? { connect: { id: createPageDto.authorId } } : undefined,
      featuredImage: createPageDto.featuredImageId ? { connect: { id: createPageDto.featuredImageId } } : undefined,
      featuredSlider: createPageDto.featuredSliderId ? { connect: { id: createPageDto.featuredSliderId } } : undefined,
      parentPage: createPageDto.parentPageId ? { connect: { id: createPageDto.parentPageId } } : undefined,
    };

    const newPage = await this.prisma.page.create({ data });
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'pages'`);
    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return newPage;
  }

  async createDraft(createPageDraftDto: CreatePageDraftDto): Promise<Page> {
    const title = createPageDraftDto.title?.trim() || 'Новая запись';
    const slug = await this.generateUniqueSlug(title);

    const draft = await this.prisma.page.create({
      data: {
        title,
        slug,
        content: createPageDraftDto.content || '',
        status: 'draft',
        template: 'default',
        authorId: createPageDraftDto.authorId,
      },
    });

    const keys = await this.redisClient.keys('pages_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }

    return draft;
  }

  async completeWithAi(prompt: string, content?: string): Promise<{ text: string }> {
    const apiKey =
      this.configService.get<string>('DEEPSEEK_API_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_DEEPSEEK_API_KEY') ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
      this.readKeyFromEnvFile();
    if (!apiKey) {
      throw new BadRequestException('DeepSeek API key is not configured on server');
    }

    const baseUrlRaw =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ||
      process.env.DEEPSEEK_BASE_URL ||
      'https://api.deepseek.com/v1';
    const baseUrl = baseUrlRaw.replace(/\/$/, '');
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const endpoint = baseUrl.endsWith('/v1') ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an assistant that edits web page content. Return only the final HTML body fragment.',
          },
          {
            role: 'user',
            content: `Instruction:\n${prompt}\n\nCurrent content:\n${content || ''}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`DeepSeek request failed: ${response.status} ${errorText}`);

      let providerMessage = 'AI generation failed';
      try {
        const parsed = JSON.parse(errorText) as { error?: { message?: string } | string; message?: string };
        if (typeof parsed.error === 'string') {
          providerMessage = parsed.error;
        } else if (parsed.error?.message) {
          providerMessage = parsed.error.message;
        } else if (parsed.message) {
          providerMessage = parsed.message;
        }
      } catch {
        if (errorText?.trim()) {
          providerMessage = errorText.slice(0, 300);
        }
      }

      throw new BadGatewayException(`AI generation failed: ${providerMessage}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new BadRequestException('AI returned empty response');
    }

    return { text };
  }

  async findAll(filterDto: PageFilterDto): Promise<any[]> {
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
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            filename: true,
            filepath: true,
          },
        },
      },
    });

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(pages), 'EX', 3600);
    return pages;
  }

  async findOne(id: number): Promise<any | null> {
    const cacheKey = `page_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedPage = await this.redisClient.get(cacheKey);

    if (cachedPage) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedPage);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            filename: true,
            filepath: true,
          },
        },
        featuredSlider: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            slides: {
              include: {
                image: true,
              },
            },
          },
        },
      },
    });

    if (page) {
      this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
      await this.redisClient.set(cacheKey, JSON.stringify(page), 'EX', 3600);
    }

    return page;
  }

  async findOneBySlug(slug: string): Promise<any | null> {
    console.log(`[PagesService] findOneBySlug called with slug: "${slug}"`);
    
    const cacheKey = `page_slug_${slug}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedPage = await this.redisClient.get(cacheKey);

    if (cachedPage) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      const parsed = JSON.parse(cachedPage);
      console.log(`[PagesService] Returning cached page:`, { id: parsed.id, slug: parsed.slug, title: parsed.title });
      return parsed;
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    console.log(`[PagesService] Querying database for slug: "${slug}"`);
    
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        featuredImage: {
          select: {
            id: true,
            filename: true,
            filepath: true,
          },
        },
        featuredSlider: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            slides: {
              include: {
                image: true,
              },
            },
          },
        },
      },
    });

    console.log(`[PagesService] Database query result:`, page ? { id: page.id, slug: page.slug, title: page.title, status: page.status } : 'null');

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

    const { metaKeywords, publishedAt, contentBlocks, featuredSliderId, ...rest } = updatePageDto;

    const data: Prisma.PageUpdateInput = {
      ...rest,
      ...(metaKeywords !== undefined && { metaKeywords }),
      ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
      ...(featuredSliderId !== undefined && { featuredSliderId: featuredSliderId || null }),
      ...(contentBlocks !== undefined && { contentBlocks: contentBlocks === null ? Prisma.DbNull : (contentBlocks as InputJsonValue) }),
      updatedAt: new Date(),
    };

    const updatedPage = await this.prisma.page.update({
      where: { id },
      data,
      include: {
        featuredSlider: true,
        featuredImage: true,
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
