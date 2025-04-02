import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TemplateModel, TemplateModelCreationAttrs } from './template.model';
import { SynchronizeTemplatesDto } from './dto/synchronize-templates.dto';

@Injectable()
export class TemplatesService {
  constructor(@InjectModel(TemplateModel) private templateRepository: typeof TemplateModel) {}

  async getTemplates(): Promise<TemplateModel[]> {
    return await this.templateRepository.findAll();
  }

  async getTemplateById(id: number | null): Promise<TemplateModel> {
    if (!id) {
      return;
    }
    const template: TemplateModel = await this.templateRepository.findOne({ where: { id } });
    if (!template) {
      throw new HttpException(`Шаблон с id ${id} не найден`, HttpStatus.NOT_FOUND);
    }
    return template;
  }

  async synchronizeTemplates(dto: SynchronizeTemplatesDto): Promise<void> {
    await this.templateRepository.destroy({ where: { id: dto.extra_templates_ids } });
    if (dto.templates) {
      const newNames: string[] = dto.templates.map((template: TemplateModelCreationAttrs) => template.name);
      const templatesExists: TemplateModel[] = await this.templateRepository.findAll({ where: { name: newNames } });
      if (templatesExists) {
        throw new HttpException(``, HttpStatus.NOT_FOUND);
      }
      await this.templateRepository.bulkCreate(dto.templates);
    }
  }
}
