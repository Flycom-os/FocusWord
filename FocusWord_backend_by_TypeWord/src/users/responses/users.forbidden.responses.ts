import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class UserForbiddenResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({
    example: 'Суперпользователя удалить нельзя | Доступ запрещён',
  })
  message: string;

  constructor() {
    this.message = 'Суперпользователя удалить нельзя';
  }
}
