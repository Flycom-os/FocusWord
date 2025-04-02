import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SeoDto {
  @ApiPropertyOptional({ example: 'Новая запись' })
  @IsOptional()
  @IsString()
  readonly seo_title?: string;
  @ApiPropertyOptional({ example: 'novaya_zapis' })
  @IsOptional()
  @IsString()
  readonly seo_label?: string;
  @ApiPropertyOptional({ example: ['новая запись'] })
  @IsOptional()
  readonly seo_keywords?: string[];
  @ApiPropertyOptional({ example: 'новая запись' })
  @IsOptional()
  @IsString()
  readonly seo_description?: string;
}
