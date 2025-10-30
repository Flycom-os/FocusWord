import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../modules/modules.service';
import { Cache } from 'cache-manager';
//initialization of module and dependencies in the project CSM
declare module '../roles/interfaces/role-access-properties.interface' {
  interface RoleAccessPropertiesInterface {
    save_pages?: boolean;
    publish_pages?: boolean;
  }
}

@Injectable()
export class PagesInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private modulesService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.modulesService.setOrUpdateModule({
      name: 'pages',
      dependencies: ['users', 'seo', 'seo_presets', 'templates'],
      role_accesses: [
        {
          access_name: 'save_pages',
          access_display: 'Сохранение постов',
        },
        {
          access_name: 'publish_pages',
          access_display: 'Пубикация постов',
        },
      ],
    });
  }
}
