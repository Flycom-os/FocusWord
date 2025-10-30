import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class SliderConflictResponse {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: number = HttpStatus.CONFLICT;

  @ApiProperty({
    example: 'Категория уже существует | ' + 'Группа уже существует | ' + 'Слайдер (позиция) уже существует | ',
  })
  message: string;

  @ApiProperty({ example: 'CONFLICT' })
  error = 'CONFLICT';

  protected constructor(message: string) {
    this.message = message;
  }
}

export class CategoryExistErrorResponse extends SliderConflictResponse {
  constructor() {
    super('Категория уже существует');
  }
}

export class GroupExistErrorResponse extends SliderConflictResponse {
  constructor() {
    super('Группа уже существует');
  }
}

export class SliderExistErrorResponse extends SliderConflictResponse {
  constructor() {
    super('Слайдер (позиция) уже существует');
  }
}
