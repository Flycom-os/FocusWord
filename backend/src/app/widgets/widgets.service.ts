import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateWidgetDto } from '../dto/widgets/create-widget.dto';
import { UpdateWidgetDto } from '../dto/widgets/update-widget.dto';
import { WidgetFilterDto } from '../dto/widgets/widget-filter.dto';

@Injectable()
export class WidgetsService {
  constructor(private prisma: PrismaService) {}

  // Helper to map DB Block to API WidgetDto
  private mapToDto(block: any) {
    if (!block) return null;
    const { isActive, ...rest } = block;
    return {
      ...rest,
      status: isActive ? 'active' : 'inactive',
    };
  }

  async create(createWidgetDto: CreateWidgetDto) {
    const existing = await this.prisma.block.findUnique({
      where: { slug: createWidgetDto.slug },
    });
    if (existing) {
      throw new BadRequestException(
        `Widget with slug "${createWidgetDto.slug}" already exists`,
      );
    }

    const isActive = createWidgetDto.status === 'inactive' ? false : true;

    // Handle content blocks blocks or serialization if needed. Content can be string or JSON object.
    const contentJson =
      typeof createWidgetDto.content === 'string'
        ? JSON.parse(createWidgetDto.content)
        : createWidgetDto.content || [];

    const block = await this.prisma.block.create({
      data: {
        name: createWidgetDto.name,
        slug: createWidgetDto.slug,
        type: createWidgetDto.type,
        content: contentJson,
        config: createWidgetDto.config || {},
        position: createWidgetDto.position || 0,
        description: createWidgetDto.description || '',
        isActive,
      },
    });

    return this.mapToDto(block);
  }

  async findAll(filterDto: WidgetFilterDto) {
    const { page = 1, limit = 10, search, type, status } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.isActive = status === 'active';
    }

    const [total, data] = await Promise.all([
      this.prisma.block.count({ where }),
      this.prisma.block.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);

    return {
      data: data.map((item) => this.mapToDto(item)),
      total,
      page,
      limit,
    };
  }

  async findById(id: number) {
    const block = await this.prisma.block.findUnique({
      where: { id },
    });
    if (!block) {
      throw new NotFoundException(`Widget with ID ${id} not found`);
    }
    return this.mapToDto(block);
  }

  async findOneBySlug(slug: string) {
    const block = await this.prisma.block.findUnique({
      where: { slug },
    });
    return this.mapToDto(block);
  }

  async update(id: number, updateWidgetDto: UpdateWidgetDto) {
    await this.findById(id); // Throws if not found

    const updateData: any = {};

    if (updateWidgetDto.name !== undefined)
      updateData.name = updateWidgetDto.name;
    if (updateWidgetDto.slug !== undefined) {
      const existing = await this.prisma.block.findFirst({
        where: { slug: updateWidgetDto.slug, NOT: { id } },
      });
      if (existing) {
        throw new BadRequestException(
          `Widget with slug "${updateWidgetDto.slug}" already exists`,
        );
      }
      updateData.slug = updateWidgetDto.slug;
    }
    if (updateWidgetDto.type !== undefined)
      updateData.type = updateWidgetDto.type;

    if (updateWidgetDto.content !== undefined) {
      updateData.content =
        typeof updateWidgetDto.content === 'string'
          ? JSON.parse(updateWidgetDto.content)
          : updateWidgetDto.content;
    }

    if (updateWidgetDto.config !== undefined)
      updateData.config = updateWidgetDto.config;
    if (updateWidgetDto.position !== undefined)
      updateData.position = updateWidgetDto.position;
    if (updateWidgetDto.description !== undefined)
      updateData.description = updateWidgetDto.description;

    if (updateWidgetDto.status !== undefined) {
      updateData.isActive = updateWidgetDto.status === 'active';
    }

    const updated = await this.prisma.block.update({
      where: { id },
      data: updateData,
    });

    return this.mapToDto(updated);
  }

  async delete(id: number) {
    await this.findById(id); // Throws if not found
    await this.prisma.block.delete({
      where: { id },
    });
  }

  async changeStatus(id: number, status: 'active' | 'inactive') {
    await this.findById(id);
    const updated = await this.prisma.block.update({
      where: { id },
      data: {
        isActive: status === 'active',
      },
    });
    return this.mapToDto(updated);
  }

  async changePosition(id: number, position: number) {
    await this.findById(id);
    const updated = await this.prisma.block.update({
      where: { id },
      data: {
        position,
      },
    });
    return this.mapToDto(updated);
  }
}
