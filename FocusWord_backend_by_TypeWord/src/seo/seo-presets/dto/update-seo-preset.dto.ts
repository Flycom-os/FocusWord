import { ApiPropertyOptional } from '@nestjs/swagger';
import { SeoDto } from '../../dto/create-seo.dto';

export class UpdateSeoPresetDto extends SeoDto {
  @ApiPropertyOptional({ example: 'Новый пресет' })
  name?: string;

  @ApiPropertyOptional({ example: 'Новый пресет' })
  seo_title: string;

  @ApiPropertyOptional({ example: 'Новый пресет' })
  seo_description: string;
}
