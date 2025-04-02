import { IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class FilterSlidersDto {
  @ApiProperty({
    example: 1,
    description: 'Айди группы слайдеров',
  })
  @IsNumber()
  @Type(() => Number)
  sliderGroupId: number;
}
