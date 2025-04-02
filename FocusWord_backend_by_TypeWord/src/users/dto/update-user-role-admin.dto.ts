import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { VALIDATION_INTEGER_EXCEPTION } from '../../validation/app.validation.constants';

export class UpdateUserRoleAdminDto {
  @ApiProperty({ example: 1, description: 'id роли' })
  @IsInt({ message: VALIDATION_INTEGER_EXCEPTION })
  role_id: number;
}
