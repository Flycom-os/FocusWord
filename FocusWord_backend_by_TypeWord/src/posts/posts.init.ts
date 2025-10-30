import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PostsService } from './posts.service';
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
export class PostsInit implements OnModuleInit {
  constructor(
    @Inject(PostsService)
    private postsService: PostsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(ModulesService)
    private modulesService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    await this.modulesService.setOrUpdateModule({
      name: 'posts',
      dependencies: ['posts_categories', 'seo', 'seo_presets'],
      role_accesses: [
        {
          access_name: 'save_posts',
          access_display: 'Сохранение постов',
        },
        {
          access_name: 'publish_posts',
          access_display: 'Пубикация постов',
        },
      ],
    });
  }
}
