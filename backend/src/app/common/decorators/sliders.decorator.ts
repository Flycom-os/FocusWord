import { SetMetadata } from '@nestjs/common';

export const SLIDERS_ACCESS_KEY = 'sliders_access';

export const SlidersAccess = (level: number) => SetMetadata(SLIDERS_ACCESS_KEY, level);
