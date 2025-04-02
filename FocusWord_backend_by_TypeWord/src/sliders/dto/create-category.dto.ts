import { ArrayNotEmpty, IsArray, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Вессение акции',
    description: 'Название категории слайдеров',
  })
  @IsString()
  readonly sliderCategoryName: string;

  @ApiProperty({
    example: '[3, 2]',
    description: 'Cоотношение картинки, требуемое для корректного отображения в слайдере',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly imageRation: number[];

  @ApiProperty({
    example: '100',
    description: 'Время смены слайда в миллисекндах',
  })
  @IsNumber()
  readonly slideTime: number;

  @ApiProperty({
    example: 'какой-то код',
    description: 'Код компонента слайдера',
  })
  @IsString()
  readonly shortcode: string;
}
