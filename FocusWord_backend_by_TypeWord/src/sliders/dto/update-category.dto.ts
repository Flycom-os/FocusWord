import { ArrayNotEmpty, IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiProperty({
    example: '1',
    description: 'Уникальный айди  категории слайдера',
  })
  @IsNumber()
  readonly categoryId: number;

  @ApiPropertyOptional({
    example: 'Вессение акции',
    description: 'Название категории слайдеров',
  })
  @IsOptional()
  @IsString()
  readonly sliderCategoryName: string;

  @ApiPropertyOptional({
    example: '[3, 2]',
    description: 'Cоотношение картинки, требуемое для корректного отображения в слайдере',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  readonly imageRation: number[];

  @ApiPropertyOptional({
    example: '100',
    description: 'Время смены слайда в миллисекндах',
  })
  @IsOptional()
  @IsNumber()
  readonly slideTime: number;

  @ApiPropertyOptional({
    example: 'какой-то код',
    description: 'Код компонента слайдера',
  })
  @IsOptional()
  @IsString()
  readonly shortcode: string;
}
