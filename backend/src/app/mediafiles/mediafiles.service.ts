import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMediaFileDto } from '../dto/mediafiles/create-media-file.dto';
import { UpdateMediaFileDto } from '../dto/mediafiles/update-media-file.dto';
import { QueryMediaFileDto, SortOrder } from '../dto/mediafiles/query-media-file.dto';
import IORedis from 'ioredis';
import { REDIS_CLIENT } from "../../redis/redis.module";
import { Prisma, MediaFile } from '@prisma/client';

export interface PaginatedMediaFiles {
  data: MediaFile[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class MediafilesService {
  private readonly logger = new Logger(MediafilesService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redisClient: IORedis,
  ) {}

  async create(data: CreateMediaFileDto): Promise<MediaFile> {
    const newMediaFile = await this.prisma.mediaFile.create({ data });
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'mediafiles'`);
    const keys = await this.redisClient.keys('mediafiles_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return newMediaFile;
  }

  async findAll(query: QueryMediaFileDto): Promise<PaginatedMediaFiles> {
    const cacheKey = `mediafiles_${JSON.stringify(query)}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedMediaFiles = await this.redisClient.get(cacheKey);

    if (cachedMediaFiles) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedMediaFiles);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const { page = 1, limit = 10, search, mimetype, isImage, isVideo, isAudio, sortBy, sortOrder } = query;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.MediaFileWhereInput = {};
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } },
        { caption: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (mimetype) {
      where.mimetype = mimetype;
    }
    if (isImage !== undefined) {
      where.isImage = isImage;
    }
    if (isVideo !== undefined) {
      where.isVideo = isVideo;
    }
    if (isAudio !== undefined) {
      where.isAudio = isAudio;
    }

    const orderBy: Prisma.MediaFileOrderByWithRelationInput = {};
    if (sortBy) {
        orderBy[sortBy] = sortOrder || SortOrder.DESC;
    } else {
        orderBy.uploadedAt = SortOrder.DESC; // Default sort
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.mediaFile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    const result = {
      data,
      total,
      page: pageNum,
      limit: limitNum,
    };

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(result), 'EX', 3600);
    return result;
  }

  async findOne(id: number): Promise<MediaFile> {
    const cacheKey = `mediafile_${id}`;
    this.logger.log(`[GET] Checking cache for key: ${cacheKey}`);
    const cachedMediaFile = await this.redisClient.get(cacheKey);

    if (cachedMediaFile) {
      this.logger.log(`[HIT] Cache hit for key: ${cacheKey}`);
      return JSON.parse(cachedMediaFile);
    }

    this.logger.log(`[MISS] Cache miss for key: ${cacheKey}. Fetching from DB.`);
    const mediaFile = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!mediaFile) {
      throw new NotFoundException(`MediaFile with ID ${id} not found`);
    }

    this.logger.log(`[SET] Setting cache for key: ${cacheKey}`);
    await this.redisClient.set(cacheKey, JSON.stringify(mediaFile), 'EX', 3600);
    return mediaFile;
  }

  async update(id: number, data: UpdateMediaFileDto): Promise<MediaFile> {
    const mediaFile = await this.prisma.mediaFile.update({
      where: { id },
      data,
    });
    if (!mediaFile) {
        throw new NotFoundException(`MediaFile with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: mediafile_${id}`);
    await this.redisClient.del(`mediafile_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'mediafiles'`);
    const keys = await this.redisClient.keys('mediafiles_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return mediaFile;
  }

  async remove(id: number): Promise<MediaFile> {
    const mediaFile = await this.prisma.mediaFile.delete({ where: { id } });
    if (!mediaFile) {
        throw new NotFoundException(`MediaFile with ID ${id} not found`);
    }
    this.logger.log(`[INVALIDATE] Deleting cache for key: mediafile_${id}`);
    await this.redisClient.del(`mediafile_${id}`);
    this.logger.log(`[INVALIDATE] Deleting cache for key: 'mediafiles'`);
    const keys = await this.redisClient.keys('mediafiles_*');
    if (keys.length > 0) {
      await this.redisClient.del(keys);
    }
    return mediaFile;
  }
}
