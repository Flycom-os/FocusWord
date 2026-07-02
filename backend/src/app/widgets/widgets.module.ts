import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { WidgetsController } from './widgets.controller';
import { PublicWidgetsController } from './public-widgets.controller';
import { WidgetsService } from './widgets.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'kkll',
    }),
  ],
  controllers: [WidgetsController, PublicWidgetsController],
  providers: [WidgetsService, PrismaService],
  exports: [WidgetsService],
})
export class WidgetsModule {}
