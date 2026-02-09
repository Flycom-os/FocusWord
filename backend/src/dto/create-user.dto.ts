import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Email пользователя' })
  @IsEmail({}, { message: 'Некорректный email' })
  @IsNotEmpty({ message: 'Email не может быть пустым' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'Пароль пользователя' })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль не может быть пустым' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;

  @ApiProperty({ example: 'John', description: 'Имя пользователя', required: false })
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Фамилия пользователя', required: false })
  @IsOptional()
  @IsString({ message: 'Фамилия должна быть строкой' })
  lastName?: string;

  @ApiProperty({ example: 'admin', description: 'Имя роли пользователя (например, "admin", "user")', required: false })
  @IsOptional()
  @IsString({ message: 'Имя роли должно быть строкой' })
  roleName?: string; // Optional: to assign a role during creation
}
