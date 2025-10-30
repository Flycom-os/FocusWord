import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFilesDto {
  @ApiProperty({
    example: 'file.png',
    description: 'Имя файла. Доступные расширения в const-files.ts',
  })
  @IsString()
  filename: string;

  @ApiPropertyOptional({ example: 'атрибуты', description: 'Атрибуты для сео' })
  @IsOptional()
  @IsString()
  readonly alt?: string | undefined;

  @ApiPropertyOptional({
    example: 55,
    description:
      'Уровень сжатия изображений для миниаютюры. Доступно только для файлов в константы allowedImageMimeTypes',
  })
  @IsOptional()
  @Max(100, { message: 'Value must be less than or equal to 100.' })
  @Min(1, { message: 'Value must be greater than or equal to 1.' })
  @IsInt()
  @Type(() => Number)
  readonly compression?: number | undefined;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
