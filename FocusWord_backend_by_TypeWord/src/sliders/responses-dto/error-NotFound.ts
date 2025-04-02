import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class SliderNotFoundResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({
    example:
      'Категория с данным айди отсутствует | ' +
      'Группа с данным айди отсутствует | ' +
      'Слайдер с данным айди отсутствует | ' +
      'Файл с данным айди отсутствует |' +
      'Пользователь с данным айди отсутствует |',
  })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error = 'Not Found';

  protected constructor(message: string) {
    this.message = message;
  }
}

export class CategoryIdExceptionResponse extends SliderNotFoundResponse {
  constructor() {
    super('Категория с данным айди отсутствует');
  }
}

export class GroupIdExceptionResponse extends SliderNotFoundResponse {
  constructor() {
    super('Группа с данным айди отсутствует');
  }
}

export class SliderIdExceptionResponse extends SliderNotFoundResponse {
  constructor() {
    super('Слайдер с данным айди отсутствует');
  }
}
