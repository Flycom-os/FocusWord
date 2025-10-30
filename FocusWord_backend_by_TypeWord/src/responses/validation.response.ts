import { ApiProperty } from '@nestjs/swagger';
export class UnprocessableEntityResponse {
  constructor(message?: any) {
    this.statusCode = 422;
    if (message) {
      this.message = message;
    } else {
      this.message = 'Unprocessable Entity'
    }

    this.error = 'UnprocessableEntity';
  }
  @ApiProperty({ example: 422 })
  statusCode: number;

  @ApiProperty({ example: 'Unprocessable Entity', description: 'Any Type' })
  message: any;

  @ApiProperty({ example: 'Unprocessable Entity' })
  error: string;
}