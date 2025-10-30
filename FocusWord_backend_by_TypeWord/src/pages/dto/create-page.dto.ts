import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';
import { SeoDto } from '../../seo/dto/create-seo.dto';

export class CreatePageDto {
  @ApiProperty({ example: 'Заголовок страницы' })
  @IsString()
  @MaxLength(64)
  readonly title: string;

  @ApiProperty({ example: '<h1>Содержимое страницы</h1>' })
  @IsString()
  @MinLength(0)
  readonly text: string;

  @ApiPropertyOptional({ example: 1, description: 'ID шаблона' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
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

  @ApiPropertyOptional({ type: SeoDto })
  seo: SeoDto;
}
