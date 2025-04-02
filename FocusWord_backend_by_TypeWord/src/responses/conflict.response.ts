import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class ConflictResponse {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: number = HttpStatus.CONFLICT;

  @ApiProperty({ example: 'Conflict' })
  message: string;

  constructor(message?: string) {
    if (message) {
      this.message = message;
    } else {
      this.message = 'Conflict'
    }
  }
}