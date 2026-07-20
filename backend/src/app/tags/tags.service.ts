import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTagDto } from '../dto/tags/create-tag.dto';
import { UpdateTagDto } from '../dto/tags/update-tag.dto';
import { TagFilterDto } from '../dto/tags/tag-filter.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug: dto.slug }],
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Tag with this name or slug already exists',
      );
    }

    return this.prisma.tag.create({
      data: dto,
    });
  }

  async findAll(filterDto: TagFilterDto) {
    const { page = 1, limit = 10, search } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.tag.count({ where }),
      this.prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return tag;
  }

  async update(id: number, dto: UpdateTagDto) {
    await this.findOne(id); // Throws if not found

    if (dto.name || dto.slug) {
      const existing = await this.prisma.tag.findFirst({
        where: {
          OR: [
            dto.name ? { name: dto.name } : undefined,
            dto.slug ? { slug: dto.slug } : undefined,
          ].filter((x): x is any => !!x),
          NOT: { id },
        },
      });
      if (existing) {
        throw new BadRequestException(
          'Tag with this name or slug already exists',
        );
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: number) {
    await this.findOne(id); // Throws if not found
    await this.prisma.tag.delete({
      where: { id },
    });
  }
}
