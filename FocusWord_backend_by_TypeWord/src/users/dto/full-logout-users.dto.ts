import { ApiProperty } from '@nestjs/swagger';

export class FullLogoutUsersDto {
  @ApiProperty({ example: [1] })
  ids: number[];
}
