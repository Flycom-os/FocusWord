import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { SeoDto } from '../../seo/dto/create-seo.dto';

export class UpdatePageDto {
  @ApiPropertyOptional({ example: 'Заголовок страницы' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  readonly title?: string;

  @ApiPropertyOptional({ example: '<h1>Содержимое страницы</h1>' })
  @IsOptional()
  @IsString()
  @MinLength(0)
  readonly text?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID шаблона' })
  @IsOptional()
  @IsNumber()
  readonly template_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'ID SEO-пресета' })
  @IsOptional()
  @IsNumber()
  readonly seo_preset_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'Уникальный идентификатор изображения' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly file_id?: number;

  @ApiProperty({ type: SeoDto })
  seo: SeoDto;
}
