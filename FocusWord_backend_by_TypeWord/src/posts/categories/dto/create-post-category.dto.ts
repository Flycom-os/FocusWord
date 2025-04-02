import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, MaxLength } from 'class-validator';

export class CreatePostCategoryDto {
  @ApiProperty({ example: 'Записи' })
  @MaxLength(16)
  name: string;
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  system_category?: boolean;
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  seo_preset_id?: number;
}
