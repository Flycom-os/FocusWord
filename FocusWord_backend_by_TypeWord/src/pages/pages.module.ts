import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Page } from './pages.model';
import { SeoModule } from '../seo/seo.module';
import { UsersModule } from '../users/users.module';
import { TemplatesModule } from '../templates/templates.module';
import { SeoPresetsModule } from '../seo/seo-presets/seo-presets.module';
import { PageDraft } from './drafts.model';
import { FilesModule } from '../files/files.module';

@Module({
  providers: [PagesService],
  controllers: [PagesController],
  imports: [SequelizeModule.forFeature([Page, PageDraft]), SeoModule, UsersModule, TemplatesModule, SeoPresetsModule, FilesModule],
  exports: [PagesService],
})
export class PagesModule {}
