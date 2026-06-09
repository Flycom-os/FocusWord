import { IsEmail, IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email' })
  @IsEmail({}, { message: 'Invalid email' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({ example: 'John', description: 'User first name', required: false })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'User last name', required: false })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @ApiProperty({ example: 'admin', description: 'User role name (e.g., "admin", "user")', required: false })
  @IsOptional()
  @IsString({ message: 'Role name must be a string' })
  roleName?: string; // Optional: to assign a role during creation
}
