import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class FeedbackService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.feedback.create({
      data: {
        name: dto.name,
        email: dto.email,
        message: dto.message,
        rating: dto.rating,
      },
    });
  }

  async findAll() {
    return this.prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const fb = await this.prisma.feedback.findUnique({ where: { id } });
    if (!fb) throw new NotFoundException();
    return fb;
  }

  async delete(id: number) {
    return this.prisma.feedback.delete({ where: { id } });
  }
}
