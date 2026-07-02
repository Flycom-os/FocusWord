import { IsString, IsOptional, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyticsFilterDto {
  @ApiProperty({ description: 'Page number', required: false, default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Number of items per page', required: false, default: 10 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ description: 'Start date range (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date range (YYYY-MM-DD)', required: false })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Filter by page ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  pageId?: number;

  @ApiProperty({ description: 'Filter by post ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  postId?: number;

  @ApiProperty({ description: 'Filter by record ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  recordId?: number;

  @ApiProperty({ description: 'Filter by blog post ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  blogPostId?: number;

  @ApiProperty({ description: 'Filter by article ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  articleId?: number;
}
