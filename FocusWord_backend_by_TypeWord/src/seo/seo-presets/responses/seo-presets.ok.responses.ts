import { ApiProperty } from '@nestjs/swagger';

export class SeoPresetDeleteOkResponse {
  @ApiProperty({ example: 'SEO пресет(-ы) {name} успешно удален(-ы)' })
  message: string;

  constructor(name: string[] | string) {
    if (typeof name === 'string' || name.length === 1) {
      this.message = `SEO пресет ${name} успешно удален`;
    } else {
      this.message = `SEO пресеты ${name} успешно удалены`;
    }
  }
}
