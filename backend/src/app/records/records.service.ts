import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { content: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [data, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          featuredImage: true,
          featuredSlider: true
        }
      }),
      this.prisma.page.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit
    };
  }

  async findById(id: number) {
    return this.prisma.page.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true
      }
    });
  }

  async create(createRecordDto: any) {
    return this.prisma.page.create({
      data: {
        ...createRecordDto,
        publishedAt: createRecordDto.status === 'published' ? new Date() : null
      },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true
      }
    });
  }

  async update(id: number, updateRecordDto: any) {
    const data = {
      ...updateRecordDto,
      publishedAt: updateRecordDto.status === 'published' && !updateRecordDto.publishedAt 
        ? new Date() 
        : updateRecordDto.publishedAt
    };

    return this.prisma.page.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true
      }
    });
  }

  async delete(id: number) {
    return this.prisma.page.delete({
      where: { id }
    });
  }

  async changeStatus(id: number, status: 'draft' | 'published') {
    const data = {
      status,
      publishedAt: status === 'published' ? new Date() : null
    };

    return this.prisma.page.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true
      }
    });
  }
}
