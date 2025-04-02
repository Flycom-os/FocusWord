import { SetMetadata } from '@nestjs/common';
import { RoleAccessPropertiesInterface } from './interfaces/role-access-properties.interface';

export const RoleProperties = (role_properties: RoleAccessPropertiesInterface) =>
  SetMetadata('properties', role_properties);
