import { IsString, IsOptional, IsEnum } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
}

export class CreateSettingDto {
  @ApiProperty({ description: 'Ключ настройки', example: 'site_name' })
  @IsString()
  key: string;

  @ApiProperty({ description: 'Значение настройки', example: 'FocusWord' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Тип настройки', enum: SettingType, example: SettingType.STRING })
  @IsEnum(SettingType)
  type: SettingType;

  @ApiProperty({ description: 'Описание настройки', example: 'Название сайта', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Категория настройки', example: 'general', required: false })
  @IsOptional()
  @IsString()
  category?: string;
}
