import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kkll',
    }),
  ],
  controllers: [SeoController],
  providers: [SeoService, PrismaService],
  exports: [SeoService],
})
export class SeoModule {}
