import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PageAiCompleteDto {
  @ApiProperty({ description: 'Instruction for AI', example: 'Сделай текст более формальным' })
  @IsString()
  prompt: string;

  @ApiProperty({ description: 'Current page content', required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
