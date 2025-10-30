import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../../modules/modules.service';
import { ModuleCreationAttrs } from '../../modules/modules.model';
//initialization of module and dependencies in the project CSM
declare module '../../roles/interfaces/role-access-properties.interface' {
  export class RoleAccessPropertiesInterface {
    seo_presets_manage?: boolean;
  }
}

@Injectable()
export class SeoPresetsInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private moduleService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    const module: ModuleCreationAttrs = {
      name: 'seo_presets',
      dependencies: ['seo', 'users'],
      role_accesses: [
        {
          access_name: 'seo_presets_manage',
          access_display: 'Управление SEO-пресетами',
        },
      ],
    };
    await this.moduleService.setOrUpdateModule(module);
  }
}
