import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kkll',
    }),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService, PrismaService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
