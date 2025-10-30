import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
export abstract class RolesForbiddenResponse {
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  statusCode: number = HttpStatus.FORBIDDEN;

  @ApiProperty({
    example:
      'Доступ к роли запрещён | Системную роль удалить нельзя | Роль с назначенными пользователями удалить нельзя',
  })
  message: string;

  protected constructor(message: string) {
    this.message = message;
  }
}

export class ForbiddenAccessExceptionResponse extends RolesForbiddenResponse {
  @ApiProperty({ example: 'Доступ запрещён' })
  message: string;
  constructor() {
    super('Доступ запрещён');
  }
}

export class ForbiddenSystemRoleDeleteExceptionResponse extends RolesForbiddenResponse {
  constructor() {
    super('Системную роль удалить нельзя');
  }
}

export class ForbiddenRoleDeleteExceptionResponse extends RolesForbiddenResponse {
  constructor() {
    super('Роль с назначенными пользователями удалить нельзя');
  }
}

export class ForbiddenMethodUnallowResponse extends RolesForbiddenResponse {
  constructor() {
    super('Данный метод в данном случае запрещён');
  }
}
