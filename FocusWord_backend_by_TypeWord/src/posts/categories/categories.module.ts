import { forwardRef, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { PostsCategory } from './category.model';
import { ModulesModule } from '../../modules/modules.module';
import { PostsCategoriesInit } from './categories.init';
import { PostsModule } from '../posts.module';
import { SeoPresetsModule } from '../../seo/seo-presets/seo-presets.module';
import { UsersModule } from '../../users/users.module';

@Module({
  providers: [CategoriesService, PostsCategoriesInit],
  controllers: [CategoriesController],
  imports: [
    SequelizeModule.forFeature([PostsCategory]),
    forwardRef(() => PostsModule),
    ModulesModule,
    SeoPresetsModule,
    UsersModule,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
