// dto/update-user.dto.ts
import { IsOptional, IsString, IsPhoneNumber, IsNotEmpty, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({example:'John', description:'user first name'})
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'Doe', description:'user last name'})
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({example:'user@example.com', description:'user email'})
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'password123', description:'user password'})
  password?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'/uploads/avatar.jpg', description:'URL to user avatar'})
  avatarUrl?: string;
}

export class SearchUsersDto {
  @IsOptional()
  @IsString()
  @ApiProperty({example:'John', description:'search by first name', required: false})
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'Doe', description:'search by last name', required: false})
  lastName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'0', description:'page number', required: false})
  page?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'10', description:'items per page', required: false})
  limit?: string;
}

