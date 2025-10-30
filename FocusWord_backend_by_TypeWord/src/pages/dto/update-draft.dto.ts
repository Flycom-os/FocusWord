import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsOptional, MinDate } from 'class-validator';
import { UpdatePageDto } from './update-page.dto';
import { Transform } from 'class-transformer';

export class UpdateDraftDto extends UpdatePageDto {
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
