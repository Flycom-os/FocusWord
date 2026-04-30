import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiProperty({ description: 'Новое значение настройки', example: 'New Value' })
  @IsString()
  value: string;
}
