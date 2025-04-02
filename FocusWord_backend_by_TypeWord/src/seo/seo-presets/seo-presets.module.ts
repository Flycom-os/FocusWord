import { forwardRef, Module } from '@nestjs/common';
import { SeoPresetsService } from './seo-presets.service';
import { SeoPresetsController } from './seo-presets.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ModulesModule } from '../../modules/modules.module';
import { SEOPreset } from './seo-presets.model';
import { SeoPresetsInit } from './seo-presets.init';
import { UsersModule } from '../../users/users.module';
import { SeoModule } from '../seo.module';

@Module({
  providers: [SeoPresetsService, SeoPresetsInit],
  controllers: [SeoPresetsController],
  imports: [SequelizeModule.forFeature([SEOPreset]), ModulesModule, forwardRef(() => SeoModule), UsersModule],
  exports: [SeoPresetsService],
})
export class SeoPresetsModule {}
