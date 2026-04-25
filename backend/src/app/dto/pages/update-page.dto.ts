import { PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePageDto extends PartialType(CreatePageDto) {
  @ApiProperty({ description: 'The status of the page (e.g., draft, published, pending)', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'The date and time when the page was published', required: false, type: String, format: 'date-time' })
  @IsString() // Use string for date-time format in DTO, transformation to Date happens in service
  @IsNotEmpty()
  @IsOptional()
  publishedAt?: Date;

  // @ts-ignore
  @ApiProperty({ description: 'The ID of the featured slider', required: false })
  @IsInt()
  @IsOptional()
  featuredSliderId?: number | null;

  @ApiProperty({ 
    description: 'Content blocks configuration - array of objects with type (slider|media|gallery), id, position', 
    required: false,
    example: [{ type: 'slider', id: 1, position: 0 }]
  })
  @IsOptional()
  @Type(() => Object)
  contentBlocks?: Record<string, any>[] | null;
}
