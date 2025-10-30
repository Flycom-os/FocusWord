import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class ConflictExceptionResponse {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: number = HttpStatus.CONFLICT;

  @ApiProperty({ example: 'Такой пользователь уже существует' })
  message: any;

  constructor() {
    this.message = 'Такой пользователь уже существует';
  }
}
