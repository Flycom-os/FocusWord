import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class UserInternalServerError {
  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

  @ApiProperty({
    example: 'Ошибка регистрации пользователя',
  })
  message: string;

  constructor() {
    this.message = 'Ошибка регистрации пользователя';
  }
}