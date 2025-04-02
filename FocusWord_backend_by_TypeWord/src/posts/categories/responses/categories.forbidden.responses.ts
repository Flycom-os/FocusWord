import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

abstract class CategoryForbidden {
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  statusCode: HttpStatus.FORBIDDEN;
  message: string;

  protected constructor(message: string) {
    this.message = message;
  }
}

export class CategoryDeleteForbiddenResponse extends CategoryForbidden {
  @ApiProperty({ example: 'Системную категорию {name} удалить нельзя' })
  message: string;

  constructor(name: string) {
    super(`Системную категорию ${name} удалить нельзя`);
  }
}

export class CategoryUpdateForbiddenResponse extends CategoryForbidden {
  @ApiProperty({ example: 'Системную категорию {name} обновить нельзя' })
  message: string;

  constructor(name: string) {
    super(`Системную категорию ${name} обновить нельзя`);
  }
}
