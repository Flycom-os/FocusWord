import { CreatePageDto } from './create-page.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, MinDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDraftDto extends CreatePageDto {
  @ApiPropertyOptional({
    example: '2023-08-17T01:23:08.069Z',
    description: 'Дата, когда опубликуется и применятся изменения поста',
  })
  @IsOptional()
  @Transform( ({ value }) => value && new Date(value))
  @IsDate()
  @MinDate(new Date())
  date_to_publish?: Date;
}
