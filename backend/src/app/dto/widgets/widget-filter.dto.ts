import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class WidgetFilterDto {
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

  @ApiProperty({ description: 'Search term for name or slug', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    description: 'Filter by widget type',
    enum: ['text', 'image', 'slider', 'gallery', 'form', 'social', 'custom'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['text', 'image', 'slider', 'gallery', 'form', 'social', 'custom'])
  type?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
