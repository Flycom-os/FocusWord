import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../modules/modules.service';
import { Cache } from 'cache-manager';

declare module '../roles/interfaces/role-access-properties.interface' {
  interface RoleAccessPropertiesInterface {
    save_posts?: boolean;
    publish_posts?: boolean;
    posts_seo_control?: boolean;
  }
}

@Injectable()
export class TemplatesInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private modulesService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.modulesService.setOrUpdateModule({
      name: 'templates',
    });
  }
}
