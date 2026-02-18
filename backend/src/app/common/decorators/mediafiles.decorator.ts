import { SetMetadata } from '@nestjs/common';

export const MEDIAFILES_ACCESS_KEY = 'mediafiles_access';

export const MediafilesAccess = (level: number) => SetMetadata(MEDIAFILES_ACCESS_KEY, level);
