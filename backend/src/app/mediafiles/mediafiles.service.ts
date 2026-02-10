import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaFile } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMediaFileDto } from '../dto/mediafiles/create-media-file.dto';
import { UpdateMediaFileDto } from '../dto/mediafiles/update-media-file.dto';
import { QueryMediaFileDto, SortOrder } from '../dto/mediafiles/query-media-file.dto'; // Import QueryMediaFileDto and SortOrder

export interface PaginatedMediaFiles {
  data: MediaFile[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class MediafilesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateMediaFileDto): Promise<MediaFile> {
    return this.prisma.mediaFile.create({ data });
  }

  async findAll(query: QueryMediaFileDto): Promise<PaginatedMediaFiles> {
    const { page = 1, limit = 10, search, mimetype, isImage, isVideo, isAudio, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
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

    const orderBy: any = {};
    if (sortBy) {
        orderBy[sortBy] = sortOrder || SortOrder.DESC;
    } else {
        orderBy.uploadedAt = SortOrder.DESC; // Default sort
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.mediaFile.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<MediaFile> {
    const mediaFile = await this.prisma.mediaFile.findUnique({ where: { id } });
    if (!mediaFile) {
      throw new NotFoundException(`MediaFile with ID ${id} not found`);
    }
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
    return mediaFile;
  }

  async remove(id: number): Promise<MediaFile> {
    const mediaFile = await this.prisma.mediaFile.delete({ where: { id } });
    if (!mediaFile) {
        throw new NotFoundException(`MediaFile with ID ${id} not found`);
    }
    return mediaFile;
  }
}
