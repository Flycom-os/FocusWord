import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SEOPreset } from './seo-presets.model';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSeoPresetDto } from './dto/create-seo-preset.dto';
import { UpdateSeoPresetDto } from './dto/update-seo-preset.dto';
import { SeoPresetConflictResponse } from './responses/seo-presets.conflict.responses';
import { SeoPresetNotFoundResponse } from './responses/seo-presets.not-found.responses';
import { SeoPresetsDeleteForbidden, SeoPresetsUpdateForbidden } from './responses/seo-presets.forbidden.responses';
import { SeoPresetDeleteOkResponse } from './responses/seo-presets.ok.responses';
import { SeoDto } from '../dto/create-seo.dto';
import { SEO } from '../seo.model';
import { SeoService } from '../seo.service';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';

@Injectable()
export class SeoPresetsService {
  constructor(
    @InjectModel(SEOPreset)
    private seoPresetRepository: typeof SEOPreset,
    @Inject(SeoService)
    private readonly seoService: SeoService,
  ) {}

  /**getting all seo presets */
  async getSeoPresets(): Promise<SEOPreset[]> {
    return await this.seoPresetRepository.findAll();
  }

  /**getting preset by ID */
  async getSeoPresetById(id: number | null): Promise<SEOPreset> | null {
    if (!id) {
      return null;
    }
    const seoPreset: SEOPreset = await this.seoPresetRepository.findOne({ where: { id } });
    if (!seoPreset) {
      throw new HttpException(`SEO-пресет с id ${id} не найден`, HttpStatus.NOT_FOUND);
    }
    return seoPreset;
  }

  /**get seo-presets for paggination */
  async gerSeoPresetsForPage(page: number, per_page: number): Promise<GetForPageIntf<SEOPreset>> {
    const offset: number = (page - 1) * per_page;
    return await this.seoPresetRepository
      .findAndCountAll({
        limit: per_page,
        offset: offset,
      })
      .then(({ rows, count }) => ({
        current_page: page,
        total_pages: Math.ceil(count / per_page),
        count: count,
        rows: rows,
      }));
  }

  /**creating new seo preset */
  async createSeoPreset(dto: CreateSeoPresetDto): Promise<SEOPreset> {
    const preset: SEOPreset = await this.seoPresetRepository.findOne({
      where: { name: dto.name },
    });
    if (preset) {
      throw new SeoPresetConflictResponse(dto.name);
    }
    return await this.seoPresetRepository.create(dto);
  }

  /**create new seo-preset for draft post and pages */
  async createSeoPresetDrafts(seoPreset?: SEOPreset, seoDto?: SeoDto): Promise<SEO> {
    if (!seoPreset) {
      return await this.seoService.createSeo(seoDto);
    }
    const seoData: SeoDto = new SeoDto();
    for (const key of Object.keys(seoPreset.dataValues)) {
      if (!(key === 'id' || key === 'system_preset' || key === 'name'))
        if (seoDto) {
          if (!seoDto[key]) {
            seoData[key] = seoPreset.dataValues[key];
          } else {
            seoData[key] = seoDto[key];
          }
        } else {
          seoData[key] = seoPreset.dataValues[key];
        }
    }
    return await this.seoService.createSeo(seoData);
  }

  /**update information seo preset by ID */
  async updateSeoPreset(id: number, dto: UpdateSeoPresetDto): Promise<SEOPreset> {
    const seoPreset: SEOPreset = await this.getSeoPresetById(id);
    if (!seoPreset) {
      throw new SeoPresetNotFoundResponse(id);
    }
    if (seoPreset.system_preset) {
      throw new SeoPresetsUpdateForbidden(seoPreset.name);
    }
    if (dto.name) {
      const seoPresetExists: SEOPreset = await this.seoPresetRepository.findOne({ where: { name: dto.name } });
      if (seoPresetExists) {
        throw new SeoPresetConflictResponse(dto.name);
      }
    }
    return await this.seoPresetRepository
      .update(dto, { where: { id }, returning: true })
      .then((value: [affectedCount: number, affectedRows: SEOPreset[]]) => value[1][0]);
  }

  /**delete seo preset by ID */
  async deleteSeoPreset(id: number): Promise<SeoPresetDeleteOkResponse> {
    const seoPresets: SEOPreset[] = await this.seoPresetRepository.findAll({ where: { id } });
    if (!seoPresets) {
      throw new SeoPresetNotFoundResponse(id);
    }
    const seo_presets_names: string[] = seoPresets.map((seoPreset: SEOPreset) => {
      if (seoPreset.system_preset) {
        throw new SeoPresetsDeleteForbidden(seoPreset.name);
      }
      return seoPreset.name;
    });
    await this.seoPresetRepository.destroy({ where: { id } });
    return new SeoPresetDeleteOkResponse(seo_presets_names);
  }
}
