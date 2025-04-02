import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class SeoPresetConflictResponse {
  @ApiProperty({ example: HttpStatus.CONFLICT })
  statusCode: HttpStatus.CONFLICT;
  @ApiProperty({ example: 'SEO пресет с названием {name} уже существует' })
  message: string;

  constructor(name: string) {
    this.message = `SEO пресет с названием ${name} уже существует`;
  }
}
