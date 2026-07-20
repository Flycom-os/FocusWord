import { PartialType } from '@nestjs/swagger';
import { CreateRecordDto } from './create-record.dto';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  @ApiProperty({
    description: 'The status of the record (e.g., draft, published)',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'The date and time when the record was published',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  publishedAt?: string;

  @ApiProperty({
    description: 'The ID of the featured slider',
    required: false,
  })
  @IsInt()
  @IsOptional()
  featuredSliderId?: number | null;

  @ApiProperty({
    description: 'Content blocks configuration',
    required: false,
  })
  @IsOptional()
  @Type(() => Object)
  contentBlocks?: Record<string, any>[] | null;
}
