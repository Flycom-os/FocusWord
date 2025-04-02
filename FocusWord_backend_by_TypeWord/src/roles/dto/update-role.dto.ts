import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  VALIDATION_ARRAY_EXCEPTION,
  VALIDATION_ARRAY_INTEGER_EXCEPTION,
  VALIDATION_MAX_LENGTH_EXCEPTION,
  VALIDATION_MIN_LENGTH_EXCEPTION,
  VALIDATION_STRING_EXCEPTION,
} from '../../validation/app.validation.constants';
import { RoleAccessPropertiesInterface } from '../interfaces/role-access-properties.interface';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Редактор', description: 'название роли' })
  @IsOptional()
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  @MinLength(3, { message: VALIDATION_MIN_LENGTH_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  readonly name?: string;

  // @ApiPropertyOptional({ example: 'object' })
  @IsOptional()
  accesses?: RoleAccessPropertiesInterface;

  @ApiProperty({ example: 1, description: 'id создателя роли' })
  @IsInt()
  user_creator_id?: number;

  @ApiPropertyOptional({
    type: [Number],
    example: [1],
    description: 'какие роли может назначать? (по id)',
  })
  @IsOptional()
  @IsArray({ message: VALIDATION_ARRAY_EXCEPTION })
  @IsInt({ each: true, message: VALIDATION_ARRAY_INTEGER_EXCEPTION })
  readonly roles_to_access?: number[];
}
