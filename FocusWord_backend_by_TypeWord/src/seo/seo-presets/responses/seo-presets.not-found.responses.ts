import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class SeoPresetNotFoundResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: HttpStatus.NOT_FOUND;
  @ApiProperty({ example: 'SEO пресет(-ы) с id {id} не найден(-ы)' })
  message: string;

  constructor(id: number[] | number) {
    if (typeof id === 'number' || id.length === 1) {
      this.message = `SEO пресет с id ${id} не найден`;
    } else {
      this.message = `SEO пресеты с id ${id} не найдены`;
    }
  }
}
