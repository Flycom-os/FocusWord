import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  VALIDATION_EMAIL_EXCEPTION,
  VALIDATION_MAX_LENGTH_EXCEPTION,
  VALIDATION_MIN_LENGTH_EXCEPTION,
  VALIDATION_STRING_EXCEPTION,
} from '../../validation/app.validation.constants';

export class UpdateUserSelfDto {
  @ApiPropertyOptional({ example: 'Имя Фамилия', description: 'имя пользователя (не уникальное)' })
  @IsOptional()
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @MinLength(3, { message: VALIDATION_MIN_LENGTH_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly name?: string;

  @ApiPropertyOptional({ example: 'test@gmail.com', description: 'уникальная почта' })
  @IsOptional()
  @IsEmail({}, { message: VALIDATION_EMAIL_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly email?: string;

  @ApiPropertyOptional({ example: '1234qwerty', description: 'пароль' })
  @IsOptional()
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @MinLength(8, { message: VALIDATION_MIN_LENGTH_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly password?: string;
}
