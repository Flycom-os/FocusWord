import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export abstract class SliderISEResponse {
  @ApiProperty({ example: HttpStatus.INTERNAL_SERVER_ERROR })
  statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

  @ApiProperty({
    example: 'Ошибка записи в бд | ' + 'Произошла ошибка при удалении | ' + 'Ошибка обновление записи в бд | ',
  })
  message: string;

  @ApiProperty({ example: 'INTERNAL SERVER ERROR' })
  error = 'INTERNAL SERVER ERROR';

  protected constructor(message: string) {
    this.message = message;
  }
}

export class SliderErrorDbResponse extends SliderISEResponse {
  constructor(err: string) {
    super('Ошибка записи в бд ' + err);
  }
}
export class SliderUpdateDbErrorResponse extends SliderISEResponse {
  constructor(err: string) {
    super('Ошибка обновление записи в бд ' + err);
  }
}

export class SliderDeleteErrorResponse extends SliderISEResponse {
  constructor(err: string) {
    super('Произошла ошибка при удалении' + err);
  }
}
