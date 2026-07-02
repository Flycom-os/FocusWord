import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCommentDto {
  @ApiProperty({ description: 'The text content of the comment', required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'The moderation status of the comment', enum: ['pending', 'approved', 'rejected'], required: false })
  @IsString()
  @IsOptional()
  @IsIn(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';
}
