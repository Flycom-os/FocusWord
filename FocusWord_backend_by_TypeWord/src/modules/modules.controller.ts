import { Controller, Get } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { CustomModule } from './modules.model';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Модули')
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  /**installed modules on the backend*/
  @Get('/backend-installed')
  @ApiOperation({ summary: 'Получение установленных модулей на Backend' })
  @ApiOkResponse({ description: 'получение всех модулей', type: [CustomModule] })
  async getCustomModules(): Promise<CustomModule[]> {
    return await this.modulesService.getCustomModules();
  }
}
