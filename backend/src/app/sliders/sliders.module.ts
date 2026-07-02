import { Module } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { SlidersController } from './sliders.controller';
import { PublicSlidersController } from './public-sliders.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../user/auth/auth.module'; // Required for JwtAuthGuard

@Module({
  imports: [AuthModule],
  providers: [SlidersService, PrismaService],
  controllers: [SlidersController, PublicSlidersController],
  exports: [SlidersService],
})
export class SlidersModule {}
