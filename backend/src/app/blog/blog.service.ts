import { Injectable, NotFoundException, Inject, Logger, BadRequestException, BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateBlogPostDto } from '../dto/blog/create-blog-post.dto';
import { CreateBlogPostDraftDto } from '../dto/blog/create-blog-post-draft.dto';
import { BlogFilterDto } from '../dto/blog/blog-filter.dto';
import { UpdateBlogPostDto } from '../dto/blog/update-blog-post.dto';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { Prisma, BlogPost } from '@prisma/client';
import { InputJsonValue } from '@prisma/client/runtime/library';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

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
        if (trimmed.startsWith('DEEPSEEK_API_KEY=')) return trimmed.slice('DEEPSEEK_API_KEY='.length).trim();
        if (trimmed.startsWith('NEXT_PUBLIC_DEEPSEEK_API_KEY=')) return trimmed.slice('NEXT_PUBLIC_DEEPSEEK_API_KEY='.length).trim();
      }
    }
    return undefined;
  }

  private async generateUniqueSlug(base: string): Promise<string> {
    const normalized = (base || 'new-blog-post')
      .toLowerCase().trim()
      .replace(/[^a-z0-9\u0430-\u044f\u0451\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const baseSlug = normalized || `blog-post-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.blogPost.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    return slug;
  }

  async create(dto: CreateBlogPostDto): Promise<BlogPost> {
    const data: Prisma.BlogPostCreateInput = {
      title: dto.title,
      slug: dto.slug,
      content: dto.content,
      excerpt: dto.excerpt,
      status: dto.status || 'draft',
      template: dto.template || 'default',
      seoTitle: dto.seoTitle,
      seoDescription: dto.seoDescription,
      metaKeywords: dto.metaKeywords || [],
      contentBlocks: dto.contentBlocks === null || dto.contentBlocks === undefined ? [] : dto.contentBlocks,
      author: dto.authorId ? { connect: { id: dto.authorId } } : undefined,
      featuredImage: dto.featuredImageId ? { connect: { id: dto.featuredImageId } } : undefined,
      featuredSlider: dto.featuredSliderId ? { connect: { id: dto.featuredSliderId } } : undefined,
      categories: dto.categoryIds && dto.categoryIds.length > 0
        ? { connect: dto.categoryIds.map((id: number) => ({ id })) }
        : undefined,
      enableFeedback: dto.enableFeedback ?? true,
      paymentMethod: dto.paymentMethodId ? { connect: { id: dto.paymentMethodId } } : undefined,
    };
    const newPost = await this.prisma.blogPost.create({
      data,
      include: {
        categories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
    const keys = await this.redisClient.keys('blog_posts_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return newPost;
  }

  async createDraft(dto: CreateBlogPostDraftDto): Promise<BlogPost> {
    const title = dto.title?.trim() || 'Новая запись блога';
    const slug = await this.generateUniqueSlug(title);
    const draft = await this.prisma.blogPost.create({
      data: { title, slug, content: dto.content || '', status: 'draft', template: 'default', authorId: dto.authorId },
    });
    const keys = await this.redisClient.keys('blog_posts_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return draft;
  }

  async completeWithAi(prompt: string, content?: string): Promise<{ text: string }> {
    const apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') ||
      this.configService.get<string>('NEXT_PUBLIC_DEEPSEEK_API_KEY') ||
      process.env.DEEPSEEK_API_KEY || process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY ||
      this.readKeyFromEnvFile();
    if (!apiKey) throw new BadRequestException('DeepSeek API key is not configured on server');
    const baseUrlRaw = this.configService.get<string>('DEEPSEEK_BASE_URL') || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
    const baseUrl = baseUrlRaw.replace(/\/$/, '');
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    const endpoint = baseUrl.endsWith('/v1') ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are an assistant that edits blog post content. Return only the final HTML body fragment.' },
          { role: 'user', content: `Instruction:\n${prompt}\n\nCurrent content:\n${content || ''}` },
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
        if (typeof parsed.error === 'string') providerMessage = parsed.error;
        else if (parsed.error?.message) providerMessage = parsed.error.message;
        else if (parsed.message) providerMessage = parsed.message;
      } catch { if (errorText?.trim()) providerMessage = errorText.slice(0, 300); }
      throw new BadGatewayException(`AI generation failed: ${providerMessage}`);
    }
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) throw new BadRequestException('AI returned empty response');
    return { text };
  }

  async findAll(filterDto: BlogFilterDto): Promise<any[]> {
    const cacheKey = `blog_posts_${JSON.stringify(filterDto)}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const { search, status, authorId, page = 1, limit = 10 } = filterDto;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;
    const where: Prisma.BlogPostWhereInput = {};
    if (search) { where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }]; }
    if (status) where.status = status;
    if (authorId) where.authorId = authorId;
    const posts = await this.prisma.blogPost.findMany({
      where, skip, take: limitNum, orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true } },
        featuredImage: { select: { id: true, filename: true, filepath: true } },
        categories: { select: { id: true, name: true, slug: true } },
      },
    });
    await this.redisClient.set(cacheKey, JSON.stringify(posts), 'EX', 3600);
    return posts;
  }

  async findOne(id: number): Promise<any | null> {
    const cacheKey = `blog_post_${id}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true } },
        featuredImage: { select: { id: true, filename: true, filepath: true } },
        featuredSlider: { select: { id: true, name: true, slug: true, description: true, slides: { orderBy: { sortOrder: 'asc' }, include: { image: true } } } },
        categories: { select: { id: true, name: true, slug: true } },
        paymentMethod: true
      },
    });
    if (post) await this.redisClient.set(cacheKey, JSON.stringify(post), 'EX', 3600);
    return post;
  }

  async findPublished(search?: string): Promise<any[]> {
    const where: Prisma.BlogPostWhereInput = { status: 'published' };
    if (search?.trim()) {
      where.OR = [{ title: { contains: search.trim(), mode: 'insensitive' } }, { slug: { contains: search.trim(), mode: 'insensitive' } }];
    }
    return this.prisma.blogPost.findMany({
      where, orderBy: { publishedAt: 'desc' },
      select: { id: true, title: true, slug: true, excerpt: true, status: true, publishedAt: true, updatedAt: true, seoTitle: true, seoDescription: true },
    });
  }

  async findOneBySlug(slug: string): Promise<any | null> {
    const cacheKey = `blog_post_slug_${slug}`;
    const cached = await this.redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, username: true, firstName: true, lastName: true } },
        featuredImage: { select: { id: true, filename: true, filepath: true } },
        featuredSlider: { select: { id: true, name: true, slug: true, description: true, slides: { orderBy: { sortOrder: 'asc' }, include: { image: true } } } },
        categories: { select: { id: true, name: true, slug: true } },
        paymentMethod: true
      },
    });
    if (post) await this.redisClient.set(cacheKey, JSON.stringify(post), 'EX', 3600);
    return post;
  }

  async update(id: number, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Blog post with ID ${id} not found.`);
    const { metaKeywords, publishedAt, contentBlocks, featuredSliderId, categoryIds, ...rest } = dto;
    const data: Prisma.BlogPostUpdateInput = {
      ...rest,
      ...(metaKeywords !== undefined && { metaKeywords }),
      ...(publishedAt !== undefined && { publishedAt: publishedAt ? new Date(publishedAt) : null }),
      ...(featuredSliderId !== undefined && { featuredSliderId: featuredSliderId || null }),
      ...(contentBlocks !== undefined && { contentBlocks: contentBlocks === null ? Prisma.DbNull : (contentBlocks as InputJsonValue) }),
      ...(categoryIds !== undefined && {
        categories: categoryIds
          ? { set: categoryIds.map((cId: number) => ({ id: cId })) }
          : undefined
      }),
      updatedAt: new Date(),
    };
    const updated = await this.prisma.blogPost.update({ where: { id }, data, include: { featuredSlider: true, featuredImage: true, categories: { select: { id: true, name: true, slug: true } } } });
    await this.redisClient.del(`blog_post_${id}`);
    await this.redisClient.del(`blog_post_slug_${existing.slug}`);
    const keys = await this.redisClient.keys('blog_posts_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return updated;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Blog post with ID ${id} not found.`);
    await this.prisma.blogPost.delete({ where: { id } });
    await this.redisClient.del(`blog_post_${id}`);
    await this.redisClient.del(`blog_post_slug_${existing.slug}`);
    const keys = await this.redisClient.keys('blog_posts_*');
    if (keys.length > 0) await this.redisClient.del(keys);
  }

  async publish(id: number): Promise<BlogPost> {
    const updated = await this.prisma.blogPost.update({
      where: { id }, data: { status: 'published', publishedAt: new Date(), updatedAt: new Date() },
    });
    await this.redisClient.del(`blog_post_${id}`);
    await this.redisClient.del(`blog_post_slug_${updated.slug}`);
    const keys = await this.redisClient.keys('blog_posts_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return updated;
  }

  async unpublish(id: number): Promise<BlogPost> {
    const updated = await this.prisma.blogPost.update({
      where: { id }, data: { status: 'draft', publishedAt: null, updatedAt: new Date() },
    });
    await this.redisClient.del(`blog_post_${id}`);
    await this.redisClient.del(`blog_post_slug_${updated.slug}`);
    const keys = await this.redisClient.keys('blog_posts_*');
    if (keys.length > 0) await this.redisClient.del(keys);
    return updated;
  }
}
