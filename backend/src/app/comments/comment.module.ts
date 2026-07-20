import { Module } from '@nestjs/common';
import { CommentController } from './comment/comment.controller';
import { CommentsService } from './comment/comment_service';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kkll',
    }),
  ],
  controllers: [CommentController],
  providers: [CommentsService, PrismaService],
  exports: [CommentsService],
})
export class CommentModule {}
