import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterRoleDto {
  @ApiPropertyOptional({ example: 'Пользователь', type: String })
  @IsOptional()
  @IsString()
  name?: object;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  system_role?: boolean;
}
