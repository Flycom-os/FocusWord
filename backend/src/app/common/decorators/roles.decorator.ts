import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...permissions: string[]) => SetMetadata(ROLES_KEY, permissions);
