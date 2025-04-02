import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteGroupDto {
  @ApiProperty({
    example: '[1, 3]',
    description: 'Айди удаляемых групп слайдеров(удаляются привязанные слайды)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly group_id: number[];
}
