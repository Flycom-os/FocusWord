import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class BadRequestResponse {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number = HttpStatus.CONFLICT;

  @ApiProperty({ example: 'Bad Request', description: 'Error message (Any type)' })
  message: Array<any> | string | Record<string, any>;

  constructor(message?: Array<any> | string | Record<string, any>) {
    if (message) {
      this.message = message;
    } else {
      this.message = 'Bad Request'
    }
  }
}