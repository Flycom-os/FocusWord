import { IsString, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSliderDto {
  @ApiProperty({ description: 'The name of the slider', example: 'Homepage Carousel' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The unique slug for the slider', example: 'homepage-carousel' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'A description of the slider (optional)', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'IDs of the slides associated with this slider (optional)', type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  slideIds?: number[]; // To associate existing slides
}
