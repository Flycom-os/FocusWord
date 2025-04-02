import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ModulesService } from '../../modules/modules.service';
import { ModuleCreationAttrs } from '../../modules/modules.model';
import { CategoriesService } from './categories.service';
import { PostsCategory } from './category.model';
import { SeoPresetsService } from '../../seo/seo-presets/seo-presets.service';
import { SEOPreset } from '../../seo/seo-presets/seo-presets.model';

declare module '../../roles/interfaces/role-access-properties.interface' {
  interface RoleAccessPropertiesInterface {
    posts_categories_manage?: boolean;
  }
}

@Injectable()
export class PostsCategoriesInit implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    @Inject(CategoriesService)
    private categoriesService: CategoriesService,
    @Inject(SeoPresetsService)
    private seoPresetsService: SeoPresetsService,
    @Inject(ModulesService)
    private moduleService: ModulesService,
  ) {}
  async onModuleInit(): Promise<void> {
    const module: ModuleCreationAttrs = {
      name: 'posts_categories',
      dependencies: ['posts'],
      role_accesses: [
        {
          access_name: 'posts_categories_manage',
          access_display: 'Управление категориями постов',
        },
      ],
    };
    await this.moduleService.setOrUpdateModule(module);
    try {
      await this.categoriesService.getCategoryById(1);
    } catch (HttpException) {
      const postsDefaultPreset: SEOPreset = await this.seoPresetsService.createSeoPreset({
        name: 'Посты без категории',
        system_preset: true,
        seo_title: 'abc',
        seo_description: 'abc',
        seo_keywords: ['1', '2'],
        seo_label: 'abc',
      });
      const defaultCategory: PostsCategory = await this.categoriesService.createCategory({
        name: 'Посты без категории',
        system_category: true,
        seo_preset_id: postsDefaultPreset.id,
      });
      await defaultCategory.$set('seo_preset', postsDefaultPreset);
    }
  }
}
