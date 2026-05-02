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
      this.prisma.record.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          featuredImage: true,
          featuredSlider: true,
          categories: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      this.prisma.record.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit
    };
  }

  async findById(id: number) {
    return this.prisma.record.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }

  async create(createRecordDto: any) {
    try {
      console.log('Creating record with DTO:', createRecordDto);

      const { categoryIds, ...recordData } = createRecordDto;

      const data = {
        ...recordData,
        publishedAt: createRecordDto.status === 'published' ? new Date() : null
      };

      // Ensure content is not empty
      if (!data.content || data.content.trim() === '') {
        data.content = ' '; // Empty content with space
      }

      // Ensure contentBlocks is valid JSON
      if (data.contentBlocks && typeof data.contentBlocks === 'string') {
        try {
          JSON.parse(data.contentBlocks);
        } catch (e) {
          data.contentBlocks = '[]';
        }
      } else if (!data.contentBlocks) {
        data.contentBlocks = '[]';
      }

      // Connect categories to the record
      if (categoryIds && categoryIds.length > 0) {
        data.categories = {
          connect: categoryIds.map((id: number) => ({ id }))
        };
      }

      const result = await this.prisma.record.create({
        data,
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          featuredImage: true,
          featuredSlider: true,
          categories: {
            select: { id: true, name: true, slug: true }
          }
        }
      });

      console.log('Record created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  }

  async update(id: number, updateRecordDto: any) {
    const { categoryIds, ...recordData } = updateRecordDto;

    const data = {
      ...recordData,
      publishedAt: updateRecordDto.status === 'published' && !updateRecordDto.publishedAt
        ? new Date()
        : updateRecordDto.publishedAt
    };

    // Handle categories update
    if (categoryIds && categoryIds.length > 0) {
      data.categories = {
        set: categoryIds.map((id: number) => ({ id }))
      };
    } else {
      data.categories = {
        set: []
      };
    }

    return this.prisma.record.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }

  async delete(id: number) {
    return this.prisma.record.delete({
      where: { id }
    });
  }

  async changeStatus(id: number, status: 'draft' | 'published') {
    const data = {
      status,
      publishedAt: status === 'published' ? new Date() : null
    };

    return this.prisma.record.update({
      where: { id },
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        featuredImage: true,
        featuredSlider: true,
        categories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }
}
