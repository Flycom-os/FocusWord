import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityLogDto {
  @ApiProperty({ description: 'The action performed', minLength: 1 })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiProperty({ description: 'The type of the entity involved', required: false })
  @IsString()
  @IsOptional()
  entityType?: string;

  @ApiProperty({ description: 'The ID of the entity involved', required: false })
  @IsInt()
  @IsOptional()
  entityId?: number;

  @ApiProperty({ description: 'Additional JSON details', required: false })
  @IsOptional()
  details?: any;

  @ApiProperty({ description: 'User IP Address', required: false })
  @IsString()
  @IsOptional()
  ipAddress?: string;

  @ApiProperty({ description: 'User ID of the author', required: false })
  @IsInt()
  @IsOptional()
  userId?: number;
}
