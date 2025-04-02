import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class FileNotFoundResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({
    example: 'Файл с таким айди не существует | ' + 'Ошибка удаление файлов. Указанные айди не существуют',
  })
  message: string;

  @ApiProperty({ example: 'Not Found' })
  error = 'Not Found';

  protected constructor(message: string) {
    this.message = message;
  }
}

export class FileIdExceptionResponse extends FileNotFoundResponse {
  constructor() {
    super('Файл с таким айди не существует');
  }
}

export class FileDeleteIdExceptionResponse extends FileNotFoundResponse {
  constructor() {
    super('Ошибка удаление файлов. Указанные айди не существуют');
  }
}
