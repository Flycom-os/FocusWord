import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ description: 'The name of the tag', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The unique slug for the tag', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  slug: string;

  @ApiProperty({ description: 'Optional description of the tag', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
