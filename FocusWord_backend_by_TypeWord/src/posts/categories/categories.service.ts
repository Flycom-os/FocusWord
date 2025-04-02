import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PostsCategory } from './category.model';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { PostsService } from '../posts.service';
import { SeoPresetsService } from '../../seo/seo-presets/seo-presets.service';
import { SEOPreset } from '../../seo/seo-presets/seo-presets.model';
import { PostModel } from '../posts.model';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';
import { CategoryDeleteOkResponse } from './responses/categories-ok.responses';
import {
  CategoryDeleteForbiddenResponse,
  CategoryUpdateForbiddenResponse,
} from './responses/categories.forbidden.responses';
import { CategoriesNotFoundResponse } from './responses/categories.not-found.responses';
import { CategoriesConflictResponse } from './responses/categories.conflict.responses';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(PostsCategory)
    private postCategoriesRepository: typeof PostsCategory,
    @Inject(forwardRef(() => PostsService))
    private posts: PostsService,
    @Inject(SeoPresetsService)
    private seoPresetsService: SeoPresetsService,
  ) {}

  /** get all categories posts */
  async getCategories(): Promise<PostsCategory[]> {
    return await this.postCategoriesRepository.findAll({ include: [PostModel, SEOPreset] });
  }

  /**get category post by ID */
  async getCategoryById(category_id: number): Promise<PostsCategory> {
    const category: PostsCategory = await this.postCategoriesRepository.findOne({
      where: { id: category_id },
      include: [SEOPreset],
    });
    if (!category) {
      throw new HttpException(`Категория с id ${category_id} не найдена`, HttpStatus.NOT_FOUND);
    }
    return category
  }

  /**create new category posts */
  async createCategory(dto: CreatePostCategoryDto): Promise<PostsCategory> {
    const categoryExists: PostsCategory = await this.postCategoriesRepository.findOne({ where: { name: dto.name } });
    if (categoryExists) {
      throw new CategoriesConflictResponse(dto.name);
    }
    let seoPreset: SEOPreset = null;
    if (dto.seo_preset_id) {
      seoPreset = await this.seoPresetsService.getSeoPresetById(dto.seo_preset_id);
      if (!seoPreset) {
        throw new HttpException(`SEO пресет с id ${dto.seo_preset_id} не найден`, HttpStatus.NOT_FOUND);
      }
    }
    const new_category: PostsCategory = await this.postCategoriesRepository.create(dto);
    await new_category.$set('seo_preset', seoPreset);
    return new_category;
  }

  /**update one category post */
  async updateCategory(id: number, dto: UpdatePostCategoryDto): Promise<PostsCategory> {
    const category: PostsCategory = await this.getCategoryById(id);
    if (!category) {
      throw new CategoriesNotFoundResponse(id);
    }
    if (category.system_category) {
      throw new CategoryUpdateForbiddenResponse(category.name);
    }
    if (dto.name) {
      const categoryExists: PostsCategory = await this.postCategoriesRepository.findOne({ where: { name: dto.name } });
      if (categoryExists) {
        throw new CategoriesConflictResponse(dto.name);
      }
    }
    let seoPreset: SEOPreset = undefined;
    if (dto.seo_preset_id) {
      seoPreset = await this.seoPresetsService.getSeoPresetById(dto.seo_preset_id);
      if (!seoPreset) {
        throw new HttpException(`SEO пресет с id ${dto.seo_preset_id} не найден`, HttpStatus.NOT_FOUND);
      }
    }
    const updatedCategory: PostsCategory = await this.postCategoriesRepository
      .update(dto, {
        where: { id },
        returning: true,
      })
      .then((value: [affectedCount: number, affectedRows: PostsCategory[]]) => value[1][0]);
    if (seoPreset) {
      await updatedCategory.$set('seo_preset', seoPreset);
    }
    return updatedCategory;
  }

  /**delete one or more categorys posts */
  async deleteCategories(id: number[]): Promise<CategoryDeleteOkResponse> {
    const categories: PostsCategory[] = await this.categoriesIdsExistsCheck(id);
    const categories_names: string[] = categories.map((category: PostsCategory) => {
      if (category.system_category) {
        throw new CategoryDeleteForbiddenResponse(category.name);
      }
      return category.name;
    });
    await this.postCategoriesRepository.destroy({ where: { id } });
    return new CategoryDeleteOkResponse(categories_names);
  }

  /**check categories in database */
  private async categoriesIdsExistsCheck(ids: number[]): Promise<PostsCategory[]> {
    const categories: PostsCategory[] = await this.postCategoriesRepository.findAll({ where: { id: ids } });
    if (categories.length !== ids.length) {
      const not_exists_ids: number[] = ids.map((id: number) => {
        if (!categories.find((category: PostsCategory): boolean => category.id === id)) {
          return id;
        }
      });
      throw new CategoriesNotFoundResponse(not_exists_ids);
    }
    return categories;
  }
}
