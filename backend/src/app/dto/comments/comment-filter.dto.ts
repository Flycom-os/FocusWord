import { IsString, IsOptional, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CommentFilterDto {
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

  @ApiProperty({ description: 'Search term inside content', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: 'Filter by status', enum: ['pending', 'approved', 'rejected'], required: false })
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @ApiProperty({ description: 'Filter by related general Post ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  postId?: number;

  @ApiProperty({ description: 'Filter by related Blog Post ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  blogPostId?: number;

  @ApiProperty({ description: 'Filter by related Article ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  articleId?: number;

  @ApiProperty({ description: 'Filter by author User ID', required: false })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  authorId?: number;
}
