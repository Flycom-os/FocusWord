import { ApiProperty } from '@nestjs/swagger';

export class DeleteUsersDto {
  @ApiProperty({ example: [1], description: 'id пользователей' })
  ids: number[];
}
