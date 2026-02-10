import { PartialType } from '@nestjs/swagger';
import { CreatePageDto } from './create-page.dto';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
