import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class RolesConflictResponse {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: number = HttpStatus.CONFLICT;

  @ApiProperty({ example: 'Роль {name} уже существует' })
  message: string;

  protected constructor(message: string) {
    this.message = message;
  }
}

export class RoleConflictExceptionResponse extends RolesConflictResponse {
  constructor(name: string) {
    super(`Роль ${name} уже существует`);
  }
}
