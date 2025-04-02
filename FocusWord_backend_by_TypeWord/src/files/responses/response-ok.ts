import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

let dto: object;
export abstract class FilesOkResponse {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode: number = HttpStatus.OK;

  @ApiProperty({
    example: 'Файл успешно создан |' + '',
  })
  message: string;

  @ApiProperty({ example: `Возвращаемый объект: ${dto}` })
  object: object;

  protected constructor(message: string, dto_example: object) {
    this.message = message;
    dto = dto_example;
  }
}
