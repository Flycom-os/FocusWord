import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePageDraftDto {
  @ApiProperty({ description: 'Draft title', required: false, default: 'Новая запись' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Draft content', required: false, default: '' })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ description: 'The ID of the author', required: false })
  @IsInt()
  @IsOptional()
  authorId?: number;
}
