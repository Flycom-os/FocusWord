import { IsOptional, IsInt, Min, Max, IsString, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

// Enum for sorting direction
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryMediaFileDto {
  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page for pagination',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for filename or altText',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by MIME type (e.g., image/jpeg, video/mp4)',
    required: false,
  })
  @IsOptional()
  @IsString()
  mimetype?: string;

  @ApiProperty({
    description: 'Filter for image files',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isImage?: boolean;

  @ApiProperty({
    description: 'Filter for video files',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVideo?: boolean;

  @ApiProperty({
    description: 'Filter for audio files',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAudio?: boolean;

  @ApiProperty({
    description: 'Filter by uploader ID',
    required: false,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  uploadedById?: number;

  @ApiProperty({
    description: 'Field to sort by (e.g., filename, uploadedAt, fileSize)',
    required: false,
    default: 'uploadedAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'uploadedAt';

  @ApiProperty({
    description: 'Sort order (asc or desc)',
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
