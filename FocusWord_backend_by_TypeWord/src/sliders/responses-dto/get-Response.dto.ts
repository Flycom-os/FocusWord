import { ApiProperty } from '@nestjs/swagger';
import { SliderGroupModel } from '../model/sliderGroup.model';

export class getCategoryDto {
  @ApiProperty({
    example: 'Весенние акции',
    description: 'Название категории слайдеров',
  })
  sliderCategoryName: string;
}

export class getCategoryForPagDto {
  @ApiProperty({
    example: 1,
    description: 'Общее количество страниц/номер страницы',
  })
  total_pages: number;

  @ApiProperty({
    type: [getCategoryDto],
    description: 'Название категорий на странице',
  })
  rows: [getCategoryDto];
}

export class getGroupForPagDto {
  @ApiProperty({
    example: 1,
    description: 'Общее количество страниц/номер страницы',
  })
  total_pages: number;

  @ApiProperty({
    type: [SliderGroupModel],
    description: 'Группа на странице',
  })
  rows: [getSliderDto];
}

export class getSliderDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '8 марта' })
  sliderName: string;

  @ApiProperty({ example: 0 })
  position: number;

  @ApiProperty({ example: true })
  visibility: boolean;

  @ApiProperty({ example: 1 })
  groupId: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: '2023-08-23T10:00:51.006Z' })
  createdAt: string;

  @ApiProperty({ example: '2023-08-23T10:00:51.006Z' })
  updatedAt: string;

  @ApiProperty({ example: '{filepath: ..путь к файлу..}' })
  miniature: { filepath: string };
}
export class getSliderForPagDto {
  @ApiProperty({
    example: 1,
    description: 'Общее количество страниц/номер страницы',
  })
  total_pages: number;

  @ApiProperty({
    type: [getSliderDto],
    description: 'Слайдер на странице',
  })
  rows: [getSliderDto];
}
