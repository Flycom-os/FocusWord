import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterUserDto {
  @ApiPropertyOptional({ example: 'Имя Фамилия', type: String })
  @IsOptional()
  @IsString()
  name?: object;

  @ApiPropertyOptional({ example: false, type: Boolean })
  @IsOptional()
  @IsBoolean()
  is_banned?: boolean;

  @ApiPropertyOptional({ example: 1, type: Number })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  role_id?: number;
}
