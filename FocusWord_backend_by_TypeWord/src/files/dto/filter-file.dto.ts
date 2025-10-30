import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterFileDto {
  @ApiPropertyOptional({ example: 'Имя файла', type: String })
  @IsOptional()
  @IsString()
  filename?: object;

  @ApiPropertyOptional({ example: 'Файл сжатием или без', type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  image?: string;
}
