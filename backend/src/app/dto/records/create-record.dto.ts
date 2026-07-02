import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRecordDto {
  @ApiProperty({ description: 'The title of the record', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The unique slug for the record', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  slug: string;

  @ApiProperty({ description: 'The HTML content of the record' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The status of the record (e.g., draft, published)', required: false, default: 'draft' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'The ID of the author', required: false })
  @IsInt()
  @IsOptional()
  authorId?: number;

  @ApiProperty({ description: 'The ID of the featured image', required: false })
  @IsInt()
  @IsOptional()
  featuredImageId?: number;

  @ApiProperty({ description: 'The ID of the featured slider', required: false })
  @IsInt()
  @IsOptional()
  featuredSliderId?: number | null;

  @ApiProperty({ description: 'The SEO title for the record', required: false })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ description: 'The SEO description for the record', required: false })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ description: 'Keywords for SEO', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metaKeywords?: string[];

  @ApiProperty({ 
    description: 'Content blocks configuration', 
    required: false,
    type: 'array'
  })
  @IsOptional()
  @Type(() => Object)
  contentBlocks?: Record<string, any>[] | null;

  @ApiProperty({ description: 'Record template name', required: false, default: 'default' })
  @IsString()
  @IsOptional()
  template?: string;

  @ApiProperty({ description: 'Category IDs associated with the record', required: false, type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  categoryIds?: number[];
}
