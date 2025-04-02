import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class CategoriesConflictResponse {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: HttpStatus.CONFLICT;
  @ApiProperty({ example: 'Категория с названием {name} уже существует' })
  message: string;

  constructor(name: string) {
    this.message = `Категория с названием ${name} уже существует`;
  }
}
