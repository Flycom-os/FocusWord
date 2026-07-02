import { IsEmail, IsNotEmpty, MinLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class RegisterDto {
  @ApiProperty({ example: 'test@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mypassword', description: 'Password (min 6 characters)' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'John', description: 'User last name' })
  @IsNotEmpty()
  surname: string;

  @ApiProperty({ example: '2', description: 'Access level (optional)', required: false })
  @IsOptional()
  permission?: number;
}
