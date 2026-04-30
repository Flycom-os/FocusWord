import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {};

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          posts: {
            select: { id: true, title: true, slug: true, status: true }
          },
          parentCategory: {
            select: { id: true, name: true, slug: true }
          },
          childCategories: {
            select: { id: true, name: true, slug: true }
          }
        }
      }),
      this.prisma.category.count({ where })
    ]);

    return {
      data,
      total,
      page,
      limit
    };
  }

  async findById(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        posts: {
          select: { id: true, title: true, slug: true, status: true, createdAt: true }
        },
        parentCategory: {
          select: { id: true, name: true, slug: true }
        },
        childCategories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }

  async create(createCategoryDto: any) {
    return this.prisma.category.create({
      data: createCategoryDto,
      include: {
        posts: {
          select: { id: true, title: true, slug: true, status: true }
        },
        parentCategory: {
          select: { id: true, name: true, slug: true }
        },
        childCategories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }

  async update(id: number, updateCategoryDto: any) {
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        posts: {
          select: { id: true, title: true, slug: true, status: true }
        },
        parentCategory: {
          select: { id: true, name: true, slug: true }
        },
        childCategories: {
          select: { id: true, name: true, slug: true }
        }
      }
    });
  }

  async delete(id: number) {
    return this.prisma.category.delete({
      where: { id }
    });
  }
}
