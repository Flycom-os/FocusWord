import { TemplateModel, TemplateModelCreationAttrs } from '../template.model';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SynchronizeTemplatesDto {
  @ApiPropertyOptional({ type: [TemplateModel] })
  templates: [TemplateModelCreationAttrs];

  @ApiPropertyOptional({ type: [Number] })
  extra_templates_ids: number[];
}
