import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlideDto {
  @ApiProperty({ description: 'The title of the slide (optional)', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'A description of the slide (optional)', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The URL the slide links to (optional)', required: false })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiProperty({ description: 'The display order of the slide', example: 0, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number = 0;

  @ApiProperty({ description: 'The ID of the media file to use as the slide image (optional)', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  imageId?: number;
}
