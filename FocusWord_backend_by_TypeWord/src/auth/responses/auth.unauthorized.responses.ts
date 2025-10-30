import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
//unauthorized server responses
export class UnauthorizedExceptionResponse {
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number = HttpStatus.UNAUTHORIZED;

  @ApiProperty({ example: 'Unauthorized' })
  message = 'Unauthorized';
}
