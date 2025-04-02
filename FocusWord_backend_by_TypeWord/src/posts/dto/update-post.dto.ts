import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SeoDto } from '../../seo/dto/create-seo.dto';

export class UpdatePostDto {
  @ApiProperty({ example: 'Новая запись', description: 'Название поста' })
  @IsString()
  @MaxLength(64)
  readonly title?: string;

  @ApiPropertyOptional({ example: 'Анонс', description: 'Анонс поста' })
  @IsString()
  readonly announcement?: string;

  @ApiProperty({ example: '<p>Текст новой записи<p>', description: 'Содержанине поста' })
  @IsString()
  @MinLength(0)
  readonly text?: string;

  @ApiProperty({ example: false, description: 'Видимость поста (true = открыт / false = скрыт)' })
  @IsBoolean()
  readonly visibility?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'id категории поста' })
  @IsOptional()
  @IsNumber()
  readonly category_id?: number;

  @ApiPropertyOptional({ example: 1, description: 'Уникальный идентификатор файла-изображения' })
  @IsOptional()
  @IsNumber()
  readonly file_id?: number;

  @ApiPropertyOptional({ type: SeoDto })
  seo?: SeoDto;
}
