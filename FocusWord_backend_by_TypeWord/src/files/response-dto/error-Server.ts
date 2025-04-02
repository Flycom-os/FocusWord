import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class FileISEResponse {
  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

  @ApiProperty({
    example:
      'Ошибка при создании миниатюры | ' +
      'Ошибка при создании файла | ' +
      'Ошибка удаление файла с бд | ' +
      'Ошибка обновления миниатюры файла в бд | ' +
      'Ошибка обновления файла в бд |',
  })
  message: string;

  @ApiProperty({ example: 'INTERNAL SERVER ERROR' })
  error = 'INTERNAL SERVER ERROR';

  protected constructor(message: string) {
    this.message = message;
  }
}

export class FileCreateMiniatureErrorResponse extends FileISEResponse {
  constructor(err: string) {
    super('Ошибка при создании миниатюры ' + err);
  }
}

export class FileCreateErrorResponse extends FileISEResponse {
  constructor(err: string) {
    super('Ошибка при создании файла ' + err);
  }
}

export class FileDeleteErrorResponse extends FileISEResponse {
  constructor(error: string) {
    super('Ошибка удаление файла с бд ' + error);
  }
}

export class FileUpdateErrorResponse extends FileISEResponse {
  constructor(error: string) {
    super('Ошибка обновления файла в бд ' + error);
  }
}

export class MiniatureUpdateErrorResponse extends FileISEResponse {
  constructor(error: string) {
    super('Ошибка обновления миниатюры файла в бд ' + error);
  }
}
