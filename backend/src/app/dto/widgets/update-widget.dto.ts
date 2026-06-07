import { IsString, IsOptional, IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWidgetDto {
  @ApiProperty({ description: 'The name of the widget', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The unique slug for the widget', required: false })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ 
    description: 'The type of the widget', 
    enum: ['text', 'image', 'slider', 'gallery', 'form', 'social', 'custom'],
    required: false 
  })
  @IsString()
  @IsOptional()
  @IsIn(['text', 'image', 'slider', 'gallery', 'form', 'social', 'custom'])
  type?: 'text' | 'image' | 'slider' | 'gallery' | 'form' | 'social' | 'custom';

  @ApiProperty({ description: 'The content of the widget', required: false })
  @IsOptional()
  content?: any;

  @ApiProperty({ description: 'The configuration object for the widget', required: false })
  @IsOptional()
  config?: any;

  @ApiProperty({ description: 'The status of the widget', enum: ['active', 'inactive'], required: false })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiProperty({ description: 'The display position of the widget', required: false })
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty({ description: 'Optional description of the widget', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
