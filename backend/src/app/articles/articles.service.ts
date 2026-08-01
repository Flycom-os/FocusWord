import {
  Injectable,
  NotFoundException,
  Inject,
  Logger,
  BadRequestException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateArticleDto } from '../dto/articles/create-article.dto';
import { CreateArticleDraftDto } from '../dto/articles/create-article-draft.dto';
import { ArticleFilterDto } from '../dto/articles/article-filter.dto';
import { UpdateArticleDto } from '../dto/articles/update-article.dto';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { Prisma, Article } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

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
        if (trimmed.startsWith('DEEPSEEK_API_KEY='))
          return trimmed.slice('DEEPSEEK_API_KEY='.length).trim();
        if (trimmed.startsWith('NEXT_PUBLIC_DEEPSEEK_API_KEY='))
          return trimmed.slice('NEXT_PUBLIC_DEEPSEEK_API_KEY='.length).trim();
      }
    }
    return undefined;
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    const normalized = (base || 'new-article')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0430-\u044f\u0451\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const baseSlug = normalized || `article-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const data: Prisma.ArticleCreateInput = {
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt,
      status: dto.status || 'draft',
      template: dto.template || 'default',
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      metaKeywords: dto.metaKeywords || [],
      contentBlocks:
        dto.contentBlocks === null || dto.contentBlocks === undefined
          ? []
          : dto.contentBlocks,
      author: dto.authorId ? { connect: { id: dto.authorId } } : undefined,
      featuredImage: dto.featuredImageId
        ? { connect: { id: dto.featuredImageId } }
        : undefined,
      featuredSlider: dto.featuredSliderId
        ? { connect: { id: dto.featuredSliderId } }
        : undefined,
      categories:
        dto.categoryIds && dto.categoryIds.length > 0
          ? { connect: dto.categoryIds.map((id: number) => ({ id })) }
          : undefined,
      enableFeedback: dto.enableFeedback ?? true,
      paymentMethod: dto.paymentMethodId
        ? { connect: { id: dto.paymentMethodId } }
        : undefined,
    };
    const newArticle = await this.prisma.article.create({
      data,
      include: {
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
    const keys = await this.redisClient.keys('articles_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return newArticle;
  }

  async createDraft(dto: CreateArticleDraftDto): Promise<Article> {
    const title = dto.title?.trim() || 'New Article';
    const slug = await this.generateUniqueSlug(title);
    const draft = await this.prisma.article.create({
      data: {
        title,
        slug,
        content: dto.content || '',
        status: 'draft',
        template: 'default',
        authorId: dto.authorId,
      },
    });
    const keys = await this.redisClient.keys('articles_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return draft;
  }

  async completeWithAi(
    prompt: string,
    content?: string,
  ): Promise<{ text: string }> {
    const apiKey =
      this.configService.get<string>('DEEPSEEK_API_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_DEEPSEEK_API_KEY') ||
      process.env.DEEPSEEK_API_KEY ||
      process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
      this.readKeyFromEnvFile();
    if (!apiKey)
      throw new BadRequestException(
        'DeepSeek API key is not configured on server',
      );
    const baseUrlRaw =
      this.configService.get<string>('DEEPSEEK_BASE_URL') ||
      process.env.DEEPSEEK_BASE_URL ||
      'https://api.deepseek.com/v1';
    const baseUrl = baseUrlRaw.replace(/\/$/, '');
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const endpoint = baseUrl.endsWith('/v1')
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/v1/chat/completions`;
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
            content:
              'You are an assistant that edits article content. Return only the final HTML body fragment.',
          },
          {
            role: 'user',
            content: `Instruction:
${prompt}

Current content:
${content || ''}`,
          },
        ],
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      let providerMessage = 'AI generation failed';
      try {
        const parsed = JSON.parse(errorText) as {
          error?: { message?: string } | string;
          message?: string;
        };
        if (typeof parsed.error === 'string') providerMessage = parsed.error;
        else if (parsed.error?.message) providerMessage = parsed.error.message;
        else if (parsed.message) providerMessage = parsed.message;
      } catch {
        if (errorText?.trim()) providerMessage = errorText.slice(0, 300);
      }
      throw new BadGatewayException(`AI generation failed: ${providerMessage}`);
    }
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new BadRequestException('AI returned empty response');
    return { text };
  }

  async findAll(filterDto: ArticleFilterDto): Promise<any[]> {
    const cacheKey = `articles_${JSON.stringify(filterDto)}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const { search, status, authorId, page = 1, limit = 10 } = filterDto;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    const where: Prisma.ArticleWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    const articles = await this.prisma.article.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
        featuredImage: { select: { id: true, filename: true, filepath: true } },
        categories: { select: { id: true, name: true, slug: true } },
      },
    });
    await this.redisClient.set(cacheKey, JSON.stringify(articles), 'EX', 3600);
    return articles;
  }

  async findOne(id: number): Promise<any | null> {
    const cacheKey = `article_${id}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
        featuredImage: { select: { id: true, filename: true, filepath: true } },
        featuredSlider: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            slides: { orderBy: { sortOrder: 'asc' }, include: { image: true } },
          },
        },
        categories: { select: { id: true, name: true, slug: true } },
        paymentMethod: true,
      },
    });
    if (article)
      await this.redisClient.set(cacheKey, JSON.stringify(article), 'EX', 3600);
    return article;
  }

  async findPublished(search?: string): Promise<any[]> {
    const where: Prisma.ArticleWhereInput = { status: 'published' };
    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { slug: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }
    return this.prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
        seoTitle: true,
        seoDescription: true,
      },
    });
  }

  async findOneBySlug(slug: string): Promise<any | null> {
    const cacheKey = `article_slug_${slug}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, username: true, firstName: true, lastName: true },
        },
        featuredImage: { select: { id: true, filename: true, filepath: true } },
        featuredSlider: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            slides: { orderBy: { sortOrder: 'asc' }, include: { image: true } },
          },
        },
        categories: { select: { id: true, name: true, slug: true } },
        paymentMethod: true,
      },
    });
    if (article)
      await this.redisClient.set(cacheKey, JSON.stringify(article), 'EX', 3600);
    return article;
  }

  async update(id: number, dto: UpdateArticleDto): Promise<Article> {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Article with ID ${id} not found.`);
    const {
      metaKeywords,
      publishedAt,
      contentBlocks,
      featuredSliderId,
      categoryIds,
      ...rest
    } = dto;
    const data: Prisma.ArticleUpdateInput = {
      ...rest,
      ...(metaKeywords !== undefined && { metaKeywords }),
      ...(publishedAt !== undefined && {
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      }),
      ...(featuredSliderId !== undefined && {
        featuredSliderId: featuredSliderId || null,
      }),
      ...(contentBlocks !== undefined && {
        contentBlocks:
          contentBlocks === null
            ? Prisma.DbNull
            : (contentBlocks as InputJsonValue),
      }),
      ...(categoryIds !== undefined && {
        categories: categoryIds
          ? { set: categoryIds.map((cId: number) => ({ id: cId })) }
          : undefined,
      }),
      updatedAt: new Date(),
    };
    const updated = await this.prisma.article.update({
      where: { id },
      data,
      include: {
        featuredSlider: true,
        featuredImage: true,
        categories: { select: { id: true, name: true, slug: true } },
      },
    });
    await this.redisClient.del(`article_${id}`);
    await this.redisClient.del(`article_slug_${existing.slug}`);
    const keys = await this.redisClient.keys('articles_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Article with ID ${id} not found.`);
    await this.prisma.article.delete({ where: { id } });
    await this.redisClient.del(`article_${id}`);
    await this.redisClient.del(`article_slug_${existing.slug}`);
    const keys = await this.redisClient.keys('articles_*');
    if (keys.length > 0) await this.redisClient.del(keys);
  }

  async publish(id: number): Promise<Article> {
    const updated = await this.prisma.article.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await this.redisClient.del(`article_${id}`);
    await this.redisClient.del(`article_slug_${updated.slug}`);
    const keys = await this.redisClient.keys('articles_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return updated;
  }

  async unpublish(id: number): Promise<Article> {
    const updated = await this.prisma.article.update({
      where: { id },
      data: { status: 'draft', publishedAt: null, updatedAt: new Date() },
    });
    await this.redisClient.del(`article_${id}`);
    await this.redisClient.del(`article_slug_${updated.slug}`);
    const keys = await this.redisClient.keys('articles_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return updated;
  }
}
