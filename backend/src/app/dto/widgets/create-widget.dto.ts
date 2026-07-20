import { IsString, IsNotEmpty, IsOptional, IsInt, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWidgetDto {
  @ApiProperty({ description: 'The name of the widget', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The unique slug for the widget', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'The type of the widget',
    enum: ['text', 'image', 'slider', 'gallery', 'form', 'social', 'custom'],
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['text', 'image', 'slider', 'gallery', 'form', 'social', 'custom'])
  type: 'text' | 'image' | 'slider' | 'gallery' | 'form' | 'social' | 'custom';

  @ApiProperty({ description: 'The content of the widget', required: false })
  @IsOptional()
  content?: any;

  @ApiProperty({
    description: 'The configuration object for the widget',
    required: false,
  })
  @IsOptional()
  config?: any;

  @ApiProperty({
    description: 'The status of the widget',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  @IsString()
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @ApiProperty({
    description: 'The display position of the widget',
    required: false,
    default: 0,
  })
  @IsInt()
  @IsOptional()
  position?: number;

  @ApiProperty({
    description: 'Optional description of the widget',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
