import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ActivityLogFilterDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term inside action or details',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by action type', required: false })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({ description: 'Filter by entity type', required: false })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiProperty({ description: 'Filter by user ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  userId?: number;

  @ApiProperty({ description: 'Start date range', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date range', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;
}
