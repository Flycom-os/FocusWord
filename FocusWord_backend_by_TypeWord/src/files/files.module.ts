import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { FilesModel } from './files.model';
import { MiniatureModel } from './miniature.model';
import { UsersModule } from '../users/users.module';
import { ModulesModule } from 'src/modules/modules.module';
import { FilesInit } from './files.init';
import { SliderModel } from '../sliders/model/slide.model';
import { RolesModule } from '../roles/roles.module';

@Module({
  controllers: [FilesController],
  providers: [FilesService, FilesInit],
  imports: [
    SequelizeModule.forFeature([FilesModel, MiniatureModel, SliderModel]),
    RolesModule,
    UsersModule,
    ModulesModule,
  ],
  exports: [FilesService],
})
export class FilesModule {}
