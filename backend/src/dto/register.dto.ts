import { IsEmail, IsNotEmpty, IsPhoneNumber, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class RegisterDto {
  @ApiProperty({ example: 'test@example.com', description: 'Email пользователя' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword', description: 'Пароль (минимум 6 символов)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'Имя пользователя' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'John', description: 'Фамилия пользователя' })
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: '2', description: 'Уровень доступа' })
  @IsNotEmpty()
  permission: number;

  @ApiProperty({ example: '+1234567890', description: 'Телефон пользователя' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;
}
