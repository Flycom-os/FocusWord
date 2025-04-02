import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePostCategoryDto {
  @ApiPropertyOptional({ example: 'Записи' })
  @IsOptional()
  @IsString()
  @MaxLength(16)
  name?: string;
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  system_category?: boolean;
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  seo_preset_id?: number;
}
