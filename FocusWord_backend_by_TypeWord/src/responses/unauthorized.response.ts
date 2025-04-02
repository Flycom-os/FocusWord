import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class UnauthorizedResponse {
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number = HttpStatus.UNAUTHORIZED;

  @ApiProperty({ example: 'Unauthorized' })
  message = 'Unauthorized';
}