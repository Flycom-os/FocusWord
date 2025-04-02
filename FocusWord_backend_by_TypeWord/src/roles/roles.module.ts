import { forwardRef, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './role.model';
import { RoleRoles } from './role-roles.model';
import { UsersModule } from '../users/users.module';
import { RolesInit } from './roles.init';
import { ModulesModule } from '../modules/modules.module';

@Module({
  providers: [RolesService, RolesInit],
  controllers: [RolesController],
  imports: [SequelizeModule.forFeature([Role, RoleRoles]), forwardRef(() => UsersModule), ModulesModule],
  exports: [RolesService],
})
export class RolesModule {}
