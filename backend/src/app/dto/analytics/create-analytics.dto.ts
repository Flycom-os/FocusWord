import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalyticsEntryDto {
  @ApiProperty({ description: 'The date for the analytics entry', example: '2026-06-01' })
  @IsString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Total number of views', required: false, default: 0 })
  @IsInt()
  @IsOptional()
  totalViews?: number;

  @ApiProperty({ description: 'Number of unique views', required: false, default: 0 })
  @IsInt()
  @IsOptional()
  uniqueViews?: number;

  @ApiProperty({ description: 'Bounce rate percentage', required: false })
  @IsNumber()
  @IsOptional()
  bounceRate?: number;

  @ApiProperty({ description: 'Average time spent on page in seconds', required: false })
  @IsInt()
  @IsOptional()
  avgTimeOnPage?: number;

  @ApiProperty({ description: 'Related Page ID', required: false })
  @IsInt()
  @IsOptional()
  @IsNumber()
  pageId?: number;

  @ApiProperty({ description: 'Related Post ID', required: false })
  @IsInt()
  @IsOptional()
  @IsNumber()
  postId?: number;

  @ApiProperty({ description: 'Related Record ID', required: false })
  @IsInt()
  @IsOptional()
  @IsNumber()
  recordId?: number;

  @ApiProperty({ description: 'Related Blog Post ID', required: false })
  @IsOptional()
  @IsNumber()
  blogPostId?: number;

  @ApiProperty({ description: 'Related Article ID', required: false })
  @IsOptional()
  @IsNumber()
  articleId?: number;
}
