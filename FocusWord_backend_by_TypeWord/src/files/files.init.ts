import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../modules/modules.service';
import { ModuleCreationAttrs } from '../modules/modules.model';
//initialization of module and dependencies in the project CSM
declare module '../roles/interfaces/role-access-properties.interface' {
  interface RoleAccessPropertiesInterface {
    files_module_access?: boolean;
  }
}

@Injectable()
export class FilesInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private moduleService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    const module: ModuleCreationAttrs = {
      name: 'files',
      dependencies: ['roles', 'users'],
      role_accesses: [
        {
          access_name: 'files_module_access',
          access_display: 'Доступ к медиафайлам',
        },
      ],
    };
    await this.moduleService.setOrUpdateModule(module);
  }
}
