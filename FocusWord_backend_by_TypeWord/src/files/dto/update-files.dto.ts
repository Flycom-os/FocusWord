import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFilesDto {
  @ApiPropertyOptional({ example: 2, description: 'Айди файла для обновления' })
  @IsNumber()
  readonly file_id: number;

  @ApiPropertyOptional({
    example: 'имя нового файла',
    description: 'Имя файла с расширением',
  })
  filename?: string;

  @ApiPropertyOptional({
    example: '...атрибуты...',
    description: 'Сео атрибуты файла',
  })
  @IsOptional()
  @IsString()
  readonly alt?: string;

  @ApiPropertyOptional({
    example: 55,
    description:
      'Уровень сжатия изображений для миниаютюры. Доступно только для файлов из константы allowedImageMimeTypes',
  })
  @IsOptional()
  @IsNumber()
  readonly compression?: number;
}
