import { Module } from '@nestjs/common';
import { MediafilesService } from './mediafiles.service';
import { MediafilesController } from './mediafiles.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../user/auth/auth.module'; // Import AuthModule

@Module({
  imports: [AuthModule], // Import AuthModule
  providers: [MediafilesService, PrismaService],
  controllers: [MediafilesController],
  exports: [MediafilesService],
})
export class MediafilesModule {}
