import { BeforeApplicationShutdown, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export class ModulesBeforeShutdown implements BeforeApplicationShutdown {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}
  async beforeApplicationShutdown(): Promise<void> {
    console.log('Clearing cache...');
    await this.cacheManager.reset();
  }
}
