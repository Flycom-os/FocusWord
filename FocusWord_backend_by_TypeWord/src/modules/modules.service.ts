import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CustomModule, ModuleCreationAttrs } from './modules.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

class ModuleAttrs implements ModuleCreationAttrs {
  name: string;
  dependencies: string[];
  role_accesses: Array<{ access_name: string; access_display: string }>;
  constructor(module: ModuleCreationAttrs) {
    this.name = module.name.toUpperCase();
    this.dependencies = module.dependencies.map((name: string) => name.toUpperCase()) ?? null;
    this.role_accesses = module.role_accesses ?? [];
  }
}

@Injectable()
export class ModulesService {
  constructor(
    @InjectModel(CustomModule)
    private moduleRepository: typeof CustomModule,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}
  
  /**check module dependencies in the database and cache*/
  private _checkDependencies(cache_modules: string[], db_modules: CustomModule[]): void {
    db_modules.forEach((module: CustomModule): void => {
      if (module.dependencies) {
        module.dependencies.forEach((module_name: string): void => {
          if (!cache_modules.includes(module_name)) {
            throw new Error(`Module '${module.name}' requires '${module_name}'`);
          }
        });
      }
    });
  }

  /**finding and deleting unused modules from the database*/
  private async _destroyUnusedModules(cache_modules: string[], db_modules: CustomModule[]): Promise<void> {
    console.log('Search unused modules...');
    await this._findUnusedModules(cache_modules, db_modules).finally(() =>
      console.log('Unused modules destroying finished.'),
    );
  }
  
  private async _findUnusedModules(cache_modules: string[], db_modules: CustomModule[]): Promise<void> {
    db_modules.map(async (module: CustomModule): Promise<void> => {
      if (!cache_modules.includes(module.name)) {
        console.log(`Found unused module: '${module.name}', will be destroyed.`);
        await this.moduleRepository.destroy({ where: { id: module.id } });
      }
    });
  }

  /**getting all custom modules from the database*/
  async getCustomModules(): Promise<CustomModule[]> {
    return await this.moduleRepository.findAll();
  }

  /**initialization and updating of modules at startup*/
  async setOrUpdateModule(module: ModuleCreationAttrs): Promise<void> {
    const new_module: ModuleAttrs = new ModuleAttrs(module);
    await this.moduleRepository
      .upsert(new_module, {
        conflictFields: ['name'],
        returning: true,
      })
      .then((data: [CustomModule, boolean]) => {
        return data[0];
      });
    await this.cacheManager.set(new_module.name, new_module, 0);
    console.log(`Module '${module.name}' initialization completed.`);
  }

  /**checking the dependencies of each module and destroying unused modules*/
  async bootstrapModulesInit(): Promise<void> {
    const cache_modules: string[] = await this.cacheManager.store.keys();
    const db_modules: CustomModule[] = await this.moduleRepository.findAll({
      include: CustomModule,
    });
    await this._checkDependencies(cache_modules, db_modules);
    await this._destroyUnusedModules(cache_modules, db_modules);
    for (const key of cache_modules) {
      await this.cacheManager.del(key);
    }
  }
}
