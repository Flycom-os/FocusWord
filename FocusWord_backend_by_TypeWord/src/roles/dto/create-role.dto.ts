import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  VALIDATION_ARRAY_EXCEPTION,
  VALIDATION_ARRAY_INTEGER_EXCEPTION,
  VALIDATION_MAX_LENGTH_EXCEPTION,
  VALIDATION_MIN_LENGTH_EXCEPTION,
  VALIDATION_STRING_EXCEPTION,
} from '../../validation/app.validation.constants';
import { RoleAccessPropertiesInterface } from '../interfaces/role-access-properties.interface';

export class CreateRoleDto {
  @ApiProperty({ example: 'Редактор', description: 'название роли' })
  @MinLength(3, { message: VALIDATION_MIN_LENGTH_EXCEPTION })
  @MaxLength(32, { message: VALIDATION_MAX_LENGTH_EXCEPTION })
  @IsString({ message: VALIDATION_STRING_EXCEPTION })
  readonly name: string;

  readonly accesses?: RoleAccessPropertiesInterface = {};

  @IsOptional()
  @IsBoolean()
  readonly system_role?: boolean;

  @IsOptional()
  @IsInt()
  readonly role_creator_id?: number;

  @ApiPropertyOptional({ type: [Number], example: [1], description: 'Какие роли будут в доступе?' })
  @IsArray({ message: VALIDATION_ARRAY_EXCEPTION })
  @IsInt({ each: true, message: VALIDATION_ARRAY_INTEGER_EXCEPTION })
  readonly roles_id_access?: number[] = [];
}
