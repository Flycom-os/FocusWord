import { UpdatePostDto } from './update-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, MinDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePostDraftDto extends UpdatePostDto {
  @ApiPropertyOptional({ example: 1, description: 'Уникальный идентификатор SEO-пресета' })
  @IsOptional()
  @IsNumber()
  seo_preset_id?: number;

  @ApiPropertyOptional({
    example: '2023-08-17T01:23:08.069Z',
    description: 'Дата, когда опубликуется и применятся изменения поста',
  })
  @IsOptional()
  @Transform( ({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date())
  readonly date_to_publish?: Date;
}