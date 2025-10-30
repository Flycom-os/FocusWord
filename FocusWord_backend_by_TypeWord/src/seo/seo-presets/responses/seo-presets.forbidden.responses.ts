import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

class SeoPresetsForbidden {
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  statusCode: HttpStatus.FORBIDDEN;
}

export class SeoPresetsDeleteForbidden extends SeoPresetsForbidden {
  @ApiProperty({ example: 'Системный SEO пресет {name} удалить нельзя' })
  message: string;

  constructor(name: string) {
    super();
    this.message = `Системный SEO пресет ${name} удалить нельзя`;
  }
}

export class SeoPresetsUpdateForbidden extends SeoPresetsForbidden {
  @ApiProperty({ example: 'Системный SEO пресет {name} обновить нельзя' })
  message: string;

  constructor(name: string) {
    super();
    this.message = `Системный SEO пресет ${name} обновить нельзя`;
  }
}
