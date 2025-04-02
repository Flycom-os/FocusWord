import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../modules/modules.service';
import { ModuleCreationAttrs } from '../modules/modules.model';
//initialization of module and dependencies in the project CSM
@Injectable()
export class SlidersInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private moduleService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    const module: ModuleCreationAttrs = {
      name: 'sliders',
      dependencies: ['roles'],
    };
    await this.moduleService.setOrUpdateModule(module);
  }
}
