import { IsOptional, IsInt, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAnalyticsEntryDto {
  @ApiProperty({ description: 'Total number of views', required: false })
  @IsInt()
  @IsOptional()
  totalViews?: number;

  @ApiProperty({ description: 'Number of unique views', required: false })
  @IsInt()
  @IsOptional()
  uniqueViews?: number;

  @ApiProperty({ description: 'Bounce rate percentage', required: false })
  @IsNumber()
  @IsOptional()
  bounceRate?: number;

  @ApiProperty({
    description: 'Average time spent on page in seconds',
    required: false,
  })
  @IsInt()
  @IsOptional()
  avgTimeOnPage?: number;
}
