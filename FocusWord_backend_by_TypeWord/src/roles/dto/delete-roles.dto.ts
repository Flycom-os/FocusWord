import { ApiProperty } from '@nestjs/swagger';

export class DeleteRolesDto {
  @ApiProperty({ example: [1], description: 'id пользователя(-ей)' })
  ids: number[];
}
