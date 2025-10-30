import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class NotFoundResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number = HttpStatus.NOT_FOUND;

  @ApiProperty({
    example: 'Not Found',
  })
  message: string;

  constructor(message?: string) {
    if (message) {
      this.message = message;
    } else {
      this.message = "Not Found"
    }
  }
}