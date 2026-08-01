import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecordAiCompleteDto {
  @ApiProperty({ description: 'Prompt for AI assistant' })
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @ApiProperty({
    description: 'Current record content context',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;
}
