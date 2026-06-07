import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiProperty({ description: 'The name of the tag', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The unique slug for the tag', required: false })
  @IsString()
  @IsOptional()
  @MinLength(1)
  slug?: string;

  @ApiProperty({ description: 'Optional description of the tag', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
