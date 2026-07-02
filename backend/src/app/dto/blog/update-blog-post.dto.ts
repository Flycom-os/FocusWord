import { PartialType } from '@nestjs/swagger';
import { CreateBlogPostDto } from './create-blog-post.dto';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {
  @ApiProperty({ description: 'The status', required: false })
  @IsString() @IsNotEmpty() @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Published date', required: false, type: String, format: 'date-time' })
  @IsString() @IsNotEmpty() @IsOptional()
  publishedAt?: Date;

  // @ts-ignore
  @ApiProperty({ description: 'The ID of the featured slider', required: false })
  @IsInt() @IsOptional()
  featuredSliderId?: number | null;

  @ApiProperty({ description: 'Content blocks configuration', required: false })
  @IsOptional() @Type(() => Object)
  contentBlocks?: Record<string, any>[] | null;
}
