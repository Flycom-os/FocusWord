import { ApiProperty } from '@nestjs/swagger';

export class CategoryDeleteOkResponse {
  @ApiProperty({ example: 'Категория(-ии) {names} успешно удалена(-ы)' })
  message: string;

  constructor(names: string[]) {
    if (names.length === 1) {
      this.message = `Категория ${names} успешно удалена`;
    } else {
      this.message = `Категории ${names} успешно удалены`;
    }
  }
}
