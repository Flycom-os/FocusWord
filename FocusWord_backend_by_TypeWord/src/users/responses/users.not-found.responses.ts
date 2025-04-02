import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

abstract class UserNotFound {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({
    example: 'Пользователь(-и) с id {id} не найден(-ы)',
  })
  message: string;

  protected constructor(message: string) {
    this.message = message;
  }
}

export class UsersNotFoundResponse extends UserNotFound {
  constructor(id: number[] | number) {
    super(`Пользователь(-и) с id ${id} не найден(-ы)`);
  }
}

export class UserNotFoundResponse {}
