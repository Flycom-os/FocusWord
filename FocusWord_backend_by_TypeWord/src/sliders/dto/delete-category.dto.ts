import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCategoryDto {
  @ApiProperty({
    example: '[3, 8]',
    description: 'Айди категорий для удаления (удаялется группа, слайды категории)',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly categories_id: number[];
}
