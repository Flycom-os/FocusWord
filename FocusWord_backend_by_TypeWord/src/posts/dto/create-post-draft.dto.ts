import { CreatePostDto } from './create-post.dto';
import { IsDate, IsNumber, IsOptional, MinDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreatePostDraftDto extends CreatePostDto {
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