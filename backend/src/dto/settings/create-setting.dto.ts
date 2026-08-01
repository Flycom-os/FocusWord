import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export class CreateSettingDto {
  @ApiProperty({ description: 'Setting key', example: 'site_name' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Setting value', example: 'FocusWord' })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Setting type',
    enum: SettingType,
    example: SettingType.STRING,
  })
  @IsEnum(SettingType)
  type: SettingType;

  @ApiProperty({
    description: 'Setting description',
    example: 'Site name',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Setting category',
    example: 'general',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;
}
