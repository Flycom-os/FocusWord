import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class CategoriesNotFoundResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: HttpStatus.NOT_FOUND;
  @ApiProperty({ example: 'Категория(-ии) с id {id} не найдена(-ы)' })
  message: string;

  constructor(ids: number[] | number) {
    if (typeof ids === 'number' || ids.length === 1) {
      this.message = `Категория с id ${ids} не найдена`;
    } else {
      this.message = `Категории с id ${ids} не найдены`;
    }
  }
}
