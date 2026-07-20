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
import { CreateRecordDto } from '../dto/records/create-record.dto';
import { CreateRecordDraftDto } from '../dto/records/create-record-draft.dto';
import { RecordFilterDto } from '../dto/records/record-filter.dto';
import { UpdateRecordDto } from '../dto/records/update-record.dto';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.module';
import { Prisma, Record as DbRecord } from '@prisma/client';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

@Injectable()
export class RecordsService {
  private readonly logger = new Logger(RecordsService.name);

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
    const normalized = (base || 'new-record')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/gi, '') // Removed Russian character range
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const baseSlug = normalized || `record-${Date.now()}`;
    let slug = baseSlug;
    let suffix = 1;

    while (await this.prisma.record.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private async invalidateCache() {
    this.logger.log(
      `[INVALIDATE] Deleting cache keys starting with 'records_' and 'record_slug_'`,
    );
    const listKeys = await this.redisClient.keys('records_*');
    const slugKeys = await this.redisClient.keys('record_slug_*');
    const allKeys = [...listKeys, ...slugKeys];
    if (allKeys.length > 0) {
      await this.redisClient.del(allKeys);
    }
  }

  async create(createRecordDto: CreateRecordDto): Promise<DbRecord> {
    const { categoryIds, contentBlocks, ...recordData } = createRecordDto;

    const data: Prisma.RecordCreateInput = {
      title: createRecordDto.title,
      slug: createRecordDto.slug,
      content: createRecordDto.content || ' ',
      status: createRecordDto.status || 'draft',
      template: createRecordDto.template || 'default',
      seoTitle: createRecordDto.seoTitle,
      seoDescription: createRecordDto.seoDescription,
      metaKeywords: createRecordDto.metaKeywords || [],
      contentBlocks:
        contentBlocks === null || contentBlocks === undefined
          ? []
          : (contentBlocks as any),
      publishedAt: createRecordDto.status === 'published' ? new Date() : null,
      author: createRecordDto.authorId
        ? { connect: { id: createRecordDto.authorId } }
        : undefined,
      featuredImage: createRecordDto.featuredImageId
        ? { connect: { id: createRecordDto.featuredImageId } }
        : undefined,
      featuredSlider: createRecordDto.featuredSliderId
        ? { connect: { id: createRecordDto.featuredSliderId } }
        : undefined,
      categories:
        categoryIds && categoryIds.length > 0
          ? { connect: categoryIds.map((id: number) => ({ id })) }
          : undefined,
    };

    const newRecord = await this.prisma.record.create({
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    await this.invalidateCache();
    return newRecord as any;
  }

  async createDraft(
    createRecordDraftDto: CreateRecordDraftDto,
  ): Promise<DbRecord> {
    const title = createRecordDraftDto.title?.trim() || 'New Record';
    const slug = await this.generateUniqueSlug(title);

    const draft = await this.prisma.record.create({
      data: {
        title,
        slug,
        content: createRecordDraftDto.content || '',
        status: 'draft',
        template: 'default',
        authorId: createRecordDraftDto.authorId,
        contentBlocks: [],
      },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    await this.invalidateCache();
    return draft as any;
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
    if (!apiKey) {
      throw new BadRequestException(
        'DeepSeek API key is not configured on server',
      );
    }

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
              'You are an assistant that edits web page content. Return only the final HTML body fragment.',
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
      this.logger.error(
        `DeepSeek request failed: ${response.status} ${errorText}`,
      );

      let providerMessage = 'AI generation failed';
      try {
        const parsed = JSON.parse(errorText) as {
          error?: { message?: string } | string;
          message?: string;
        };
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

    const resData = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const text = resData.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new BadRequestException('AI returned empty response');
    }

    return { text };
  }

  async findAll(filterDto: RecordFilterDto): Promise<any> {
    const cacheKey = `records_${JSON.stringify(filterDto)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedRecords = await this.redisClient.get(cacheKey);

    if (cachedRecords) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedRecords);
    }

    this.logger.log(
      `[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`,
    );
    const { search, status, authorId, page = 1, limit = 10 } = filterDto;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.RecordWhereInput = {};

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

    const [data, total] = await Promise.all([
      this.prisma.record.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          featuredImage: true,
          featuredSlider: true,
          categories: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      this.prisma.record.count({ where }),
    ]);

    const result = {
      data,
      total,
      page: pageNum,
      limit: limitNum,
    };

    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findById(id: number) {
    return this.prisma.record.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async findOneBySlug(slug: string): Promise<any | null> {
    const cacheKey = `record_slug_${slug}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedRecord = await this.redisClient.get(cacheKey);

    if (cachedRecord) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedRecord);
    }

    this.logger.log(
      `[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`,
    );
    const record = await this.prisma.record.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: {
          include: {
            slides: {
              orderBy: { sortOrder: 'asc' },
              include: {
                image: true,
              },
            },
          },
        },
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (record) {
      await this.redisClient.set(cacheKey, JSON.stringify(record), 'EX', 3600);
    }

    return record;
  }

  async findPublished(search?: string): Promise<any[]> {
    const where: Prisma.RecordWhereInput = {
      status: 'published',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.record.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async update(
    id: number,
    updateRecordDto: UpdateRecordDto,
  ): Promise<DbRecord> {
    const { categoryIds, contentBlocks, publishedAt, ...recordData } =
      updateRecordDto;

    const data: Prisma.RecordUpdateInput = {
      title: recordData.title,
      slug: recordData.slug,
      content: recordData.content,
      status: recordData.status,
      template: recordData.template,
      seoTitle: recordData.seoTitle,
      seoDescription: recordData.seoDescription,
      metaKeywords: recordData.metaKeywords,
      contentBlocks:
        contentBlocks === undefined
          ? undefined
          : contentBlocks === null
            ? []
            : (contentBlocks as any),
      publishedAt:
        recordData.status === 'published' && !publishedAt
          ? new Date()
          : publishedAt
            ? new Date(publishedAt)
            : undefined,
      featuredImage: recordData.featuredImageId
        ? { connect: { id: recordData.featuredImageId } }
        : recordData.featuredImageId === null
          ? { disconnect: true }
          : undefined,
      featuredSlider: recordData.featuredSliderId
        ? { connect: { id: recordData.featuredSliderId } }
        : recordData.featuredSliderId === null
          ? { disconnect: true }
          : undefined,
      categories: categoryIds
        ? {
            set: categoryIds.map((cId: number) => ({ id: cId })),
          }
        : undefined,
    };

    const updated = await this.prisma.record.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    await this.invalidateCache();
    return updated as any;
  }

  async delete(id: number) {
    const deleted = await this.prisma.record.delete({
      where: { id },
    });
    await this.invalidateCache();
    return deleted;
  }

  async changeStatus(id: number, status: 'draft' | 'published') {
    const data = {
      status,
      publishedAt: status === 'published' ? new Date() : null,
    };

    const updated = await this.prisma.record.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    await this.invalidateCache();
    return updated;
  }
}
