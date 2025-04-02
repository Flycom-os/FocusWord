import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  VALIDATION_EMAIL_EXCEPTION,
  VALIDATION_MAX_LENGTH_EXCEPTION,
  VALIDATION_MIN_LENGTH_EXCEPTION,
  VALIDATION_STRING_EXCEPTION,
} from '../../validation/app.validation.constants';

export class RegisterUserDto {
  @ApiProperty({
    example: 'Имя Фамилия',
    description: 'имя пользователя (не уникальное)',
  })
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @MinLength(3, { message: VALIDATION_MIN_LENGTH_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly name: string;

  @ApiProperty({ example: 'test@gmail.com', description: 'уникальная почта' })
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @IsEmail({}, { message: VALIDATION_EMAIL_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly email: string;

  @ApiProperty({
    example: '1234qwerty',
    description: 'пароль: min - 8, max - 32',
  })
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @MinLength(8, { message: VALIDATION_MIN_LENGTH_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly password: string;

  readonly superuser?: boolean;
}
