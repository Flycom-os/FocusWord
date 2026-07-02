import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PublicArticlesController } from './public-articles.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../user/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ArticlesService, PrismaService],
  controllers: [ArticlesController, PublicArticlesController],
  exports: [ArticlesService],
})
export class ArticlesModule {}
