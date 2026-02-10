import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMediaFileDto {
  @ApiProperty({ description: 'The original filename of the media file' })
  @IsString()
  filename: string;

  @ApiProperty({ description: 'The URL or path to access the media file' })
  @IsString()
  filepath: string; // This will be the URL/path to access the file

  @ApiProperty({ description: 'The MIME type of the media file' })
  @IsString()
  mimetype: string;

  @ApiProperty({ description: 'The size of the media file in bytes' })
  @IsInt()
  fileSize: number;

  @ApiProperty({ description: 'Alternative text for the media file', required: false })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiProperty({ description: 'Caption for the media file', required: false })
  @IsOptional()
  @IsString()
  caption?: string;

  @ApiProperty({ description: 'True if the media file is an image', required: false })
  @IsOptional()
  @IsBoolean()
  isImage?: boolean;

  @ApiProperty({ description: 'True if the media file is a video', required: false })
  @IsOptional()
  @IsBoolean()
  isVideo?: boolean;

  @ApiProperty({ description: 'True if the media file is an audio file', required: false })
  @IsOptional()
  @IsBoolean()
  isAudio?: boolean;

  @ApiProperty({ description: 'URL of the thumbnail for the media file (if applicable)', required: false })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiProperty({ description: 'Duration of the media file in seconds (if video/audio)', required: false })
  @IsOptional()
  @IsInt()
  duration?: number;

  @ApiProperty({ description: 'Width of the media file in pixels (if image/video)', required: false })
  @IsOptional()
  @IsInt()
  width?: number;

  @ApiProperty({ description: 'Height of the media file in pixels (if image/video)', required: false })
  @IsOptional()
  @IsInt()
  height?: number;

  // Static property for Swagger schema when used with ApiFileWithBody
  static swaggerSchema: Record<string, any> = {
    altText: { type: 'string', required: false, description: 'Alternative text for the media file' },
    caption: { type: 'string', required: false, description: 'Caption for the media file' },
  };
}
