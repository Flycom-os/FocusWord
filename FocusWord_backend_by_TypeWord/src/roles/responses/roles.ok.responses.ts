import { Role } from '../role.model';
import { ApiProperty } from '@nestjs/swagger';

export abstract class PagesOkResponse {
  @ApiProperty({ example: 1 })
  total_pages: number;

  @ApiProperty({ example: '[roles will be here]' })
  rows: Role[];
}

export class DeleteOkResponse {
  @ApiProperty({ example: 'Роль {name} успешно удалена.' })
  message: string;

  constructor(name: string[]) {
    this.message = `Роли ${name} успешно удалены.`;
  }
}
