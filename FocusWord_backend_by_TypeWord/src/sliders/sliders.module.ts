import { Module } from '@nestjs/common';
import { SlidersController } from './sliders.controller';
import { SlidersService } from './sliders.service';
import { SlidersInit } from './sliders.init';
import { RolesModule } from 'src/roles/roles.module';
import { ModulesModule } from 'src/modules/modules.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { SliderModel } from './model/slide.model';
import { SliderGroupModel } from './model/sliderGroup.model';
import { User } from '../users/user.model';
import { SliderCategoryModel } from './model/sliderCategory.model';
import { SliderCategoryController } from './slider-category.controller';
import { SliderGroupService } from './slider-group.service';
import { SliderGroupController } from './slider-group.controller';
import { SliderCategoryService } from './slider-category.service';
import { FilesModule } from '../files/files.module';
import { UsersModule } from '../users/users.module';
import { MiniatureModel } from '../files/miniature.model';

@Module({
  controllers: [SlidersController, SliderCategoryController, SliderGroupController],
  providers: [SlidersService, SliderCategoryService, SliderGroupService, SlidersInit],
  imports: [
    SequelizeModule.forFeature([SliderModel, SliderCategoryModel, SliderGroupModel, MiniatureModel, User]),
    RolesModule,
    ModulesModule,
    FilesModule,
    UsersModule,
  ],
  exports: [SlidersService],
})
export class SlidersModule {}
