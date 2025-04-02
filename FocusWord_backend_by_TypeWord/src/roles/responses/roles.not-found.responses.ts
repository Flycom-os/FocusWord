import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class RoleNotFoundResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({
    example: 'Роль с {id} не найдена | Роли с id {id} не найдены',
  })
  message: string;

  protected constructor(message: string) {
    this.message = message;
  }
}

export class RoleNotFoundExceptionResponse extends RoleNotFoundResponse {
  constructor(id: number) {
    super(`Роль с ${id} не найдена`);
  }
}

export class RolesNotFoundExceptionResponse extends RoleNotFoundResponse {
  constructor(id: number[]) {
    super(`Роли с id ${id} не найдены`);
  }
}
