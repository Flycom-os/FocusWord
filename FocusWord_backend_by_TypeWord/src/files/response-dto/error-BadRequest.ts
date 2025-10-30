import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class FileBadRequestResponse {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number = HttpStatus.BAD_REQUEST;

  @ApiProperty({
    example: 'Файл не поддерживает(не имеет) сжатие | ' + 'Неверный формат image, должны быть bool | ',
  })
  message: string;

  @ApiProperty({ example: 'BAD REQUEST' })
  error = 'BAD REQUEST';

  protected constructor(message: string) {
    this.message = message;
  }
}

export class FileNotBeCompressed extends FileBadRequestResponse {
  constructor() {
    super('Файл не поддерживает(не имеет) сжатие');
  }
}

export class FileImageNotBool extends FileBadRequestResponse {
  constructor() {
    super('Неверный формат image, должны быть bool');
  }
}
