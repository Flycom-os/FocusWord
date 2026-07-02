import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCommentDto } from '../../dto/comments/create-comment.dto';
import { UpdateCommentDto } from '../../dto/comments/update-comment.dto';
import { CommentFilterDto } from '../../dto/comments/comment-filter.dto';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCommentDto) {
    if (!dto.postId && !dto.blogPostId && !dto.articleId) {
      throw new BadRequestException('Comment must be associated with a Post, BlogPost, or Article');
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorName: dto.authorName,
        authorEmail: dto.authorEmail,
        authorId: dto.authorId,
        postId: dto.postId,
        blogPostId: dto.blogPostId,
        articleId: dto.articleId,
        parentCommentId: dto.parentCommentId,
        status: 'pending', // Default status for moderation
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async findAll(filterDto: CommentFilterDto) {
    const { page = 1, limit = 10, search, status, postId, blogPostId, articleId, authorId } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.content = { contains: search, mode: 'insensitive' };
    }

    if (status) {
      where.status = status;
    }

    if (postId) where.postId = postId;
    if (blogPostId) where.blogPostId = blogPostId;
    if (articleId) where.articleId = articleId;
    if (authorId) where.authorId = authorId;

    const [total, data] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              username: true,
              avatarUrl: true,
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
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }
    return comment;
  }

  async update(id: number, dto: UpdateCommentDto) {
    await this.findById(id); // Throws if not found

    return this.prisma.comment.update({
      where: { id },
      data: dto,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async delete(id: number) {
    await this.findById(id); // Throws if not found
    await this.prisma.comment.delete({
      where: { id },
    });
  }

  async changeStatus(id: number, status: 'pending' | 'approved' | 'rejected') {
    await this.findById(id);
    return this.prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}