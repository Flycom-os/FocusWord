import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { RolesModule } from '../roles/roles.module';
import { UsersInit } from './users.init';
import { ModulesModule } from '../modules/modules.module';
import { SliderModel } from '../sliders/model/slide.model';

@Module({
  providers: [UsersService, UsersInit],
  controllers: [UsersController],
  imports: [SequelizeModule.forFeature([User]), forwardRef(() => RolesModule), ModulesModule],
  exports: [UsersService],
})
export class UsersModule {}
