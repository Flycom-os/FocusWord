import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.model';

export abstract class PagesUsersOkResponse {
  @ApiProperty({ example: 1 })
  total_pages: number;

  @ApiProperty({ example: '[users will be here]' })
  rows: User[];
}

export class DeleteSelfResponse {
  @ApiProperty({ example: 'Вы успешно удалили свой аккаунт' })
  message = 'Вы успешно удалили свой аккаунт';
}

export class BanUsersResponse {
  @ApiProperty({
    example: 'Пользователь(-и) {name} успешно заблокирован(-ы)/разблокирован(-ы). Причина: {reason}',
  })
  message: string;

  constructor(name: string[] | string, reason: string) {
    this.message = `Пользователь(-и) ${name} успешно заблокирован(-ы). Причина: ${reason}`;
  }
}

export class UnbanUsersResponse {
  @ApiProperty({
    example: 'Пользователь(-и) {name} успешно разблокирован(-ы)',
  })
  message: string;

  constructor(name: string[] | string) {
    this.message = `Пользователь(-и) ${name} успешно разблокирован(-ы)`;
  }
}

export class UpdateSelfResponse {
  @ApiProperty({ example: 'Вы успешно обновили свой аккаунт' })
  message = 'Вы успешно обновили свой аккаунт';
}

export class DeleteUsersResponse {
  @ApiProperty({ example: 'Пользователь(-и) {names} успешно удален(-ы)' })
  message: string;

  constructor(names: string[]) {
    this.message = `Пользователь(-и) ${names} успешно удален(-ы)`;
  }
}
