import { forwardRef, Module } from '@nestjs/common';
import { SeoService } from './seo.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SEO } from './seo.model';
import { SeoPresetsModule } from './seo-presets/seo-presets.module';
import { ModulesModule } from '../modules/modules.module';
import { SeoInit } from './seo.init';
import { SEOPreset } from './seo-presets/seo-presets.model';

@Module({
  providers: [SeoService, SeoInit],
  imports: [SequelizeModule.forFeature([SEO]), SeoPresetsModule, ModulesModule, forwardRef(() => SEOPreset)],
  exports: [SeoService],
})
export class SeoModule {}
