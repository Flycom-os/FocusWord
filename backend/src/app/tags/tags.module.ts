import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kkll',
    }),
  ],
  controllers: [TagsController],
  providers: [TagsService, PrismaService],
  exports: [TagsService],
})
export class TagsModule {}
