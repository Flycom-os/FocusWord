import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeletePageDto {
  @ApiProperty({ example: [1], description: 'id страниц' })
  @IsNumber({},{each: true})
  ids: number[];
}
