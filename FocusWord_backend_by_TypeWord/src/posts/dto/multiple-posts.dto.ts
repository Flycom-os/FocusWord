import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MultiplePostsDto {
  @ApiProperty({ example: [1], description: 'Уникальные идентификаторы страниц' })
  @IsNumber({},{each: true})
  ids: number[];
}