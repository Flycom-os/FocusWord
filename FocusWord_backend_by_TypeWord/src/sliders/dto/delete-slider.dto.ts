import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteSliderDto {
  @ApiProperty({
    example: '[1, 3]',
    description: 'Айди удаляемых слайдеров',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly sliders_id: number[];
}
