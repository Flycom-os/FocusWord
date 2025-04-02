import { Module } from '@nestjs/common';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { TemplateModel } from './template.model';

@Module({
  controllers: [TemplatesController],
  providers: [TemplatesService],
  imports: [SequelizeModule.forFeature([TemplateModel])],
  exports: [TemplatesService],
})
export class TemplatesModule {}
