import { Module } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { CustomModule } from './modules.model';
import { CustomModuleModules } from './module-modules.model';
import { ModulesBootstrap } from './modules.bootstrap';
import { ModulesBeforeShutdown } from './modules.before-shutdown';
import { ModulesController } from './modules.controller';

@Module({
  providers: [ModulesService, ModulesBootstrap, ModulesBeforeShutdown],
  imports: [SequelizeModule.forFeature([CustomModule, CustomModuleModules])],
  exports: [ModulesService],
  controllers: [ModulesController],
})
export class ModulesModule {}
