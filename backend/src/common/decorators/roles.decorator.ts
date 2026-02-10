import { SetMetadata } from '@nestjs/common';

export const Roles = (...levels: number[]) => SetMetadata('roles', levels);
