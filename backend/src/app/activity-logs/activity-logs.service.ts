import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateActivityLogDto } from '../dto/activity-logs/create-activity-log.dto';
import { ActivityLogFilterDto } from '../dto/activity-logs/activity-log-filter.dto';

@Injectable()
export class ActivityLogsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateActivityLogDto) {
    return this.prisma.activityLog.create({
      data: {
        action: dto.action,
        entityType: dto.entityType,
        entityId: dto.entityId,
        details: dto.details || {},
        ipAddress: dto.ipAddress,
        userId: dto.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: ActivityLogFilterDto) {
    const { page = 1, limit = 10, search, action, entityType, userId, startDate, endDate } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entityType: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        where.timestamp.lte = new Date(endDate);
      }
    }

    const [total, data] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
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
    const log = await this.prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }
    return log;
  }

  async delete(id: number) {
    await this.findById(id); // Throws if not found
    await this.prisma.activityLog.delete({
      where: { id },
    });
  }

  async cleanup(olderThanDays: number) {
    const date = new Date();
    date.setDate(date.getDate() - olderThanDays);

    const result = await this.prisma.activityLog.deleteMany({
      where: {
        timestamp: {
          lt: date,
        },
      },
    });

    return { deletedCount: result.count };
  }

  async getStats(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [totalActions, actionsGrouped, usersGrouped, recentActions] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: { id: true },
      }),
      this.prisma.activityLog.groupBy({
        by: ['userId'],
        where: { ...where, NOT: { userId: null } },
        _count: { id: true },
      }),
      this.prisma.activityLog.findMany({
        where,
        take: 10,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      }),
    ]);

    // Map actionsByType
    const actionsByType: Record<string, number> = {};
    for (const group of actionsGrouped) {
      actionsByType[group.action] = group._count.id;
    }

    // Map actionsByUser
    const userIds = usersGrouped.map(g => g.userId).filter((id): id is number => id !== null);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, email: true },
    });

    const actionsByUser = usersGrouped.map(g => {
      const u = users.find(x => x.id === g.userId);
      return {
        userId: g.userId!,
        username: u?.username || u?.email || 'Пользователь',
        count: g._count.id,
      };
    });

    return {
      totalActions,
      actionsByType,
      actionsByUser,
      recentActions,
    };
  }

  async getActionTypes(): Promise<string[]> {
    const actions = await this.prisma.activityLog.findMany({
      distinct: ['action'],
      select: { action: true },
    });
    return actions.map(a => a.action);
  }

  async getEntityTypes(): Promise<string[]> {
    const types = await this.prisma.activityLog.findMany({
      distinct: ['entityType'],
      where: { NOT: { entityType: null } },
      select: { entityType: true },
    });
    return types.map(t => t.entityType as string);
  }
}
