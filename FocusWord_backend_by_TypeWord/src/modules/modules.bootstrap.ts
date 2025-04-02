import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { ModulesService } from './modules.service';

export class ModulesBootstrap implements OnApplicationBootstrap {
  constructor(
    @Inject(ModulesService)
    private modulesService: ModulesService,
  ) {}
  async onApplicationBootstrap(): Promise<void> {
    await this.modulesService.bootstrapModulesInit();
  }
}
