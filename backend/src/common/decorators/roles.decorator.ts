import { SetMetadata } from '@nestjs/common';

export const RequiredRoles = (...permissions: string[]) => SetMetadata('roles', permissions);
