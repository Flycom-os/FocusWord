import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../modules/modules.service';
import { ModuleCreationAttrs } from '../modules/modules.model';
//initialization of module and dependencies in the project CSM
declare module '../roles/interfaces/role-access-properties.interface' {
  interface RoleAccessPropertiesInterface {
    ban_users?: boolean;
    create_users?: boolean;
    delete_users?: boolean;
    update_users?: boolean;
    logout_users?: boolean;
  }
}

@Injectable()
export class UsersInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private moduleService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    const module: ModuleCreationAttrs = {
      name: 'users',
      dependencies: ['roles'],
      role_accesses: [
        {
          access_name: 'ban_users',
          access_display: 'Блокировка пользователей',
        },
        {
          access_name: 'create_users',
          access_display: 'Создание пользователей',
        },
        {
          access_name: 'delete_users',
          access_display: 'Удаление пользователей',
        },
        {
          access_display: 'update_users',
          access_name: 'Обновление пользователей',
        },
        {
          access_name: 'logout_users',
          access_display: 'Разлогинивание пользователей',
        },
      ],
    };
    await this.moduleService.setOrUpdateModule(module);
  }
}
