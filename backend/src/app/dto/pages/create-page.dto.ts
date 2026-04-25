import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, MinLength, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePageDto {
  @ApiProperty({ description: 'The title of the page', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The unique slug for the page', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  slug: string;

  @ApiProperty({ description: 'The HTML content of the page' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'The status of the page (e.g., draft, published, pending)', required: false, default: 'draft' })
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

  @ApiProperty({ description: 'The SEO title for the page', required: false })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiProperty({ description: 'The SEO description for the page', required: false })
  @IsString()
  @IsOptional()
  seoDescription?: string;

  @ApiProperty({ description: 'Keywords for SEO', required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  metaKeywords?: string[];

  @ApiProperty({ 
    description: 'Content blocks configuration - array of objects with type (slider|media|gallery), id, position', 
    required: false,
    example: [{ type: 'slider', id: 1, position: 0 }],
    type: 'array'
  })
  @IsOptional()
  @Type(() => Object)
  contentBlocks?: Record<string, any>[] | null;

  @ApiProperty({ description: 'The ID of the parent page for hierarchical structure', required: false })
  @IsInt()
  @IsOptional()
  parentPageId?: number;

  @ApiProperty({ description: 'Page template name', required: false, default: 'default' })
  @IsString()
  @IsOptional()
  template?: string;
}
