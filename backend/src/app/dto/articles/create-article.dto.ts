import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, MinLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateArticleDto {
  @ApiProperty({ description: 'The title of the article', minLength: 1 })
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The unique slug for the article', minLength: 3 })
  @IsString() @IsNotEmpty() @MinLength(3)
  slug: string;

  @ApiProperty({ description: 'The HTML content of the article' })
  @IsString() @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Short excerpt of the article', required: false })
  @IsString() @IsOptional()
  excerpt?: string;

  @ApiProperty({ description: 'The status of the article', required: false, default: 'draft' })
  @IsString() @IsOptional()
  status?: string;

  @ApiProperty({ description: 'The ID of the author', required: false })
  @IsInt() @IsOptional()
  authorId?: number;

  @ApiProperty({ description: 'The ID of the featured image', required: false })
  @IsInt() @IsOptional()
  featuredImageId?: number;

  @ApiProperty({ description: 'The ID of the featured slider', required: false })
  @IsInt() @IsOptional()
  featuredSliderId?: number | null;

  @ApiProperty({ description: 'The SEO title', required: false })
  @IsString() @IsOptional()
  seoTitle?: string;

  @ApiProperty({ description: 'The SEO description', required: false })
  @IsString() @IsOptional()
  seoDescription?: string;

  @ApiProperty({ description: 'Keywords for SEO', required: false, type: [String] })
  @IsArray() @IsString({ each: true }) @IsOptional()
  metaKeywords?: string[];

  @ApiProperty({ description: 'Content blocks configuration', required: false, type: 'array' })
  @IsOptional() @Type(() => Object)
  contentBlocks?: Record<string, any>[] | null;

  @ApiProperty({ description: 'Article template name', required: false, default: 'default' })
  @IsString() @IsOptional()
  template?: string;

  @ApiProperty({ description: 'Category IDs to bind to the article', required: false, type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  categoryIds?: number[];

  @ApiProperty({ description: 'Enable feedback framework on the article', required: false, default: true })
  @IsBoolean()
  @IsOptional()
  enableFeedback?: boolean;

  @ApiProperty({ description: 'The ID of the payment method to bind to the article', required: false })
  @IsInt()
  @IsOptional()
  paymentMethodId?: number | null;
}
