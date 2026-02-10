import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Page } from '@prisma/client';
import { CreatePageDto } from "../dto/pages/create-page.dto";
import { PageFilterDto } from "../dto/pages/page-filter.dto";
import { UpdatePageDto } from "../dto/pages/update-page.dto";

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async create(createPageDto: CreatePageDto): Promise<Page> {
    const { metaKeywords, ...rest } = createPageDto;
    return this.prisma.page.create({
      data: {
        ...rest,
        metaKeywords: metaKeywords || [], // Ensure metaKeywords is an array
      },
    });
  }

  async findAll(filterDto: PageFilterDto): Promise<Page[]> {
    const { search, status, authorId, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

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

    return this.prisma.page.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Page | null> {
    return this.prisma.page.findUnique({ where: { id } });
  }

  async findOneBySlug(slug: string): Promise<Page | null> {
    return this.prisma.page.findUnique({ where: { slug } });
  }

  async update(id: number, updatePageDto: UpdatePageDto): Promise<Page> {
    const existingPage = await this.prisma.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found.`);
    }

    const { metaKeywords, publishedAt, ...rest } = updatePageDto;

    return this.prisma.page.update({
      where: { id },
      data: {
        ...rest,
        ...(metaKeywords && { metaKeywords }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: number): Promise<Page> {
    const existingPage = await this.prisma.page.findUnique({ where: { id } });
    if (!existingPage) {
      throw new NotFoundException(`Page with ID ${id} not found.`);
    }
    return this.prisma.page.delete({ where: { id } });
  }

  async publish(id: number): Promise<Page> {
    return this.prisma.page.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async unpublish(id: number): Promise<Page> {
    return this.prisma.page.update({
      where: { id },
      data: {
        status: 'draft',
        publishedAt: null,
        updatedAt: new Date(),
      },
    });
  }
}
