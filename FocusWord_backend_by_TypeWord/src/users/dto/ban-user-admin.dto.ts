import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { VALIDATION_BOOLEAN_EXCEPTION, VALIDATION_STRING_EXCEPTION } from '../../validation/app.validation.constants';

export class BanUsersAdminDto {
  @ApiProperty({ example: [1], description: 'ids пользователей' })
  ids: number[];

  @ApiProperty({ example: false, description: 'пользователь заблокирован?' })
  @IsBoolean({ message: VALIDATION_BOOLEAN_EXCEPTION })
  is_banned: boolean;

  @ApiPropertyOptional({
    example: 'хулиганство',
    description: 'причина блокировки',
  })
  @IsOptional()
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  ban_reason?: string;
}
