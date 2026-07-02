import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { PublicBlogController } from './public-blog.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../user/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [BlogService, PrismaService],
  controllers: [BlogController, PublicBlogController],
  exports: [BlogService],
})
export class BlogModule {}
