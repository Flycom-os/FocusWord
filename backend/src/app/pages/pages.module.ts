import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { PublicPagesController } from './public-pages.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthModule } from '../../user/auth/auth.module'; // Import AuthModule

@Module({
  imports: [AuthModule], // Add AuthModule to imports
  providers: [PagesService, PrismaService],
  controllers: [PagesController, PublicPagesController],
  exports: [PagesService],
})
export class PagesModule {}
