import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { VALIDATION_EMAIL_EXCEPTION, VALIDATION_STRING_EXCEPTION } from '../../validation/app.validation.constants';

export class AuthUserDto {
  @ApiProperty({ example: 'test@gmail.com', description: 'уникальная почта' })
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @IsEmail({}, { message: VALIDATION_EMAIL_EXCEPTION })
  readonly email: string;

  @ApiProperty({
    example: '1234qwerty',
    description: 'пароль: min - 8, max - 32',
  })
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  readonly password: string;
}
