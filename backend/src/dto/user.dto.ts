import { IsOptional, IsString, IsNotEmpty, IsEmail, IsEnum, IsInt, Min, Max } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { SearchQueryDto, SortOrder } from "./common/search-query.dto";

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
  @ApiProperty({
    description: 'Search term to filter results across relevant fields',
    required: false,
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort the results by',
    required: false,
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    required: false,
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    required: false,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'John', description:'search by first name', required: false})
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({example:'Doe', description:'search by last name', required: false})
  lastName?: string;
}

