import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ModulesService } from '../modules/modules.service';
import { ModuleCreationAttrs } from '../modules/modules.model';
//initialization of module and dependencies in the project CSM
@Injectable()
export class RolesInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private moduleService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    const module: ModuleCreationAttrs = {
      name: 'roles',
      dependencies: ['users'],
      role_accesses: [
        {
          access_name: 'admin_panel_access',
          access_display: 'Доступ к панели администратора',
        },
        {
          access_name: 'roles_management',
          access_display: 'Управление ролями',
        },
        {
          access_name: 'all_roles_access',
          access_display: 'Доступ к всем ролям',
        },
        {
          access_name: 'roles_create_delete',
          access_display: 'Создание и удаление пользователей',
        },
        {
          access_name: 'roles_set',
          access_display: 'Назначение пользователей',
        },
      ],
    };
    await this.moduleService.setOrUpdateModule(module);
  }
}
