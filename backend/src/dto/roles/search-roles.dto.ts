import { IsOptional, IsString, IsArray, IsEnum, IsInt, Min, Max } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { SearchQueryDto, SortOrder } from "../common/search-query.dto";

export class SearchRolesDto{
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
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    required: false,
    default: 10,
    example: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100) // Assuming a reasonable max limit
  limit: number = 10;
  @ApiProperty({ description: 'The name of the role', example: 'Admin', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The description of the role', example: 'Administrator role with full access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

}
