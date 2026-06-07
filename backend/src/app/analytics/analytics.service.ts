import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAnalyticsEntryDto } from '../dto/analytics/create-analytics.dto';
import { UpdateAnalyticsEntryDto } from '../dto/analytics/update-analytics.dto';
import { AnalyticsFilterDto } from '../dto/analytics/analytics-filter.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnalyticsEntryDto) {
    const entryDate = dto.date ? new Date(dto.date) : new Date();
    
    // We can allow one entry per date + pageId/postId/recordId combo
    const where: any = {
      date: entryDate,
    };

    if (dto.pageId) {
      where.pageId = dto.pageId;
    } else if (dto.postId) {
      where.postId = dto.postId;
    } else if (dto.recordId) {
      where.recordId = dto.recordId;
    } else if (dto.blogPostId) {
      where.blogPostId = dto.blogPostId;
    } else if (dto.articleId) {
      where.articleId = dto.articleId;
    } else {
      // General entry
      where.pageId = null;
      where.postId = null;
      where.recordId = null;
      where.blogPostId = null;
      where.articleId = null;
    }

    // Check if entry already exists to prevent unique violations or to increment it
    const existing = await this.prisma.analyticsEntry.findFirst({
      where,
    });

    if (existing) {
      return this.prisma.analyticsEntry.update({
        where: { id: existing.id },
        data: {
          totalViews: { increment: dto.totalViews || 1 },
          uniqueViews: { increment: dto.uniqueViews || 1 },
          bounceRate: dto.bounceRate !== undefined ? dto.bounceRate : existing.bounceRate,
          avgTimeOnPage: dto.avgTimeOnPage !== undefined ? dto.avgTimeOnPage : existing.avgTimeOnPage,
        },
      });
    }

    return this.prisma.analyticsEntry.create({
      data: {
        date: entryDate,
        totalViews: dto.totalViews || 1,
        uniqueViews: dto.uniqueViews || 1,
        bounceRate: dto.bounceRate || 0,
        avgTimeOnPage: dto.avgTimeOnPage || 0,
        pageId: dto.pageId,
        postId: dto.postId,
        recordId: dto.recordId,
        blogPostId: dto.blogPostId,
        articleId: dto.articleId,
      },
    });
  }

  async update(id: number, dto: UpdateAnalyticsEntryDto) {
    await this.findById(id); // Throws if not found

    return this.prisma.analyticsEntry.update({
      where: { id },
      data: dto,
    });
  }

  async findAll(filterDto: AnalyticsFilterDto) {
    const { page = 1, limit = 10, startDate, endDate, pageId, postId, recordId } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (pageId) where.pageId = pageId;
    if (postId) where.postId = postId;
    if (recordId) where.recordId = recordId;
    if (filterDto.blogPostId) where.blogPostId = filterDto.blogPostId;
    if (filterDto.articleId) where.articleId = filterDto.articleId;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [total, data] = await Promise.all([
      this.prisma.analyticsEntry.count({ where }),
      this.prisma.analyticsEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          referrers: true,
          page: { select: { title: true } },
          post: { select: { title: true } },
          record: { select: { title: true } },
          blogPost: { select: { title: true } },
          article: { select: { title: true } },
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findById(id: number) {
    const entry = await this.prisma.analyticsEntry.findUnique({
      where: { id },
      include: {
        referrers: true,
      },
    });
    if (!entry) {
      throw new NotFoundException(`Analytics entry with ID ${id} not found`);
    }
    return entry;
  }

  async delete(id: number) {
    await this.findById(id); // Throws if not found
    await this.prisma.analyticsEntry.delete({
      where: { id },
    });
  }

  async getReferrers(analyticsId: number) {
    await this.findById(analyticsId);
    return this.prisma.referrerDetail.findMany({
      where: { analyticsEntryId: analyticsId },
      orderBy: { count: 'desc' },
    });
  }

  async addReferrer(analyticsId: number, referrerUrl: string) {
    await this.findById(analyticsId);

    const existing = await this.prisma.referrerDetail.findFirst({
      where: {
        analyticsEntryId: analyticsId,
        referrerUrl,
      },
    });

    if (existing) {
      return this.prisma.referrerDetail.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
        },
      });
    }

    return this.prisma.referrerDetail.create({
      data: {
        referrerUrl,
        count: 1,
        analyticsEntryId: analyticsId,
      },
    });
  }

  async getStats(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const entries = await this.prisma.analyticsEntry.findMany({
      where,
      include: {
        page: { select: { title: true } },
        post: { select: { title: true } },
        record: { select: { title: true } },
        blogPost: { select: { title: true } },
        article: { select: { title: true } },
        referrers: true,
      },
    });

    let totalViews = 0;
    let uniqueViews = 0;
    let sumBounceRate = 0;
    let bounceCount = 0;
    let sumTimeOnPage = 0;
    let timeCount = 0;

    const pageViewsMap: Record<string, { id: number; title: string; views: number }> = {};
    const referrersMap: Record<string, number> = {};

    for (const entry of entries) {
      totalViews += entry.totalViews;
      uniqueViews += entry.uniqueViews;

      if (entry.bounceRate !== null) {
        sumBounceRate += entry.bounceRate;
        bounceCount++;
      }

      if (entry.avgTimeOnPage !== null) {
        sumTimeOnPage += entry.avgTimeOnPage;
        timeCount++;
      }

      // Group views by pages/posts/records
      if (entry.pageId && entry.page) {
        const key = `page_${entry.pageId}`;
        if (!pageViewsMap[key]) {
          pageViewsMap[key] = { id: entry.pageId, title: entry.page.title, views: 0 };
        }
        pageViewsMap[key].views += entry.totalViews;
      } else if (entry.postId && entry.post) {
        const key = `post_${entry.postId}`;
        if (!pageViewsMap[key]) {
          pageViewsMap[key] = { id: entry.postId, title: entry.post.title, views: 0 };
        }
        pageViewsMap[key].views += entry.totalViews;
      } else if (entry.recordId && entry.record) {
        const key = `record_${entry.recordId}`;
        if (!pageViewsMap[key]) {
          pageViewsMap[key] = { id: entry.recordId, title: entry.record.title, views: 0 };
        }
        pageViewsMap[key].views += entry.totalViews;
      } else if (entry.blogPostId && entry.blogPost) {
        const key = `blogPost_${entry.blogPostId}`;
        if (!pageViewsMap[key]) {
          pageViewsMap[key] = { id: entry.blogPostId, title: entry.blogPost.title, views: 0 };
        }
        pageViewsMap[key].views += entry.totalViews;
      } else if (entry.articleId && entry.article) {
        const key = `article_${entry.articleId}`;
        if (!pageViewsMap[key]) {
          pageViewsMap[key] = { id: entry.articleId, title: entry.article.title, views: 0 };
        }
        pageViewsMap[key].views += entry.totalViews;
      }

      // Group referrers
      for (const ref of entry.referrers) {
        referrersMap[ref.referrerUrl] = (referrersMap[ref.referrerUrl] || 0) + ref.count;
      }
    }

    const avgBounceRate = bounceCount > 0 ? Number((sumBounceRate / bounceCount).toFixed(2)) : 0;
    const avgTimeOnPage = timeCount > 0 ? Math.round(sumTimeOnPage / timeCount) : 0;

    const topPages = Object.values(pageViewsMap)
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topReferrers = Object.entries(referrersMap)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalViews,
      uniqueViews,
      avgBounceRate,
      avgTimeOnPage,
      topPages,
      topReferrers,
    };
  }
}
