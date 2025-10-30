import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class ForbiddenResponse {
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  statusCode: number = HttpStatus.FORBIDDEN;

  @ApiProperty({ example: 'Forbidden' })
  message: string;

  constructor(message?: string) {
    if (message) {
      this.message = message;
    } else {
      this.message = "Forbidden"
    }
  }
}