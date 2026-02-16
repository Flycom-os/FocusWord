import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Enum for sorting direction
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QuerySliderDto {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for slider/slide name, title or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by (e.g., name, createdAt, sortOrder)',
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
