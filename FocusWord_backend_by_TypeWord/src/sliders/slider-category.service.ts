import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SliderCategoryModel } from './model/sliderCategory.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { SliderGroupModel } from './model/sliderGroup.model';
import { SliderModel } from './model/slide.model';
import { CategoryIdExceptionResponse } from './responses-dto/error-NotFound';
import { CategoryExistErrorResponse } from './responses-dto/error-Conflict';
import {
  SliderDeleteErrorResponse,
  SliderErrorDbResponse,
  SliderUpdateDbErrorResponse,
} from './responses-dto/error-Server';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { GetCategoryIntf } from './interface/slider.interface';
import { FilterCategoryDto } from './filter/filter-category.dto';

@Injectable()
export class SliderCategoryService {
  constructor(@InjectModel(SliderCategoryModel) private categoryRep: typeof SliderCategoryModel) {}
  //POST
  /**creating new slider category  */
  async createCategory(dto: CreateCategoryDto): Promise<SliderCategoryModel> {
    const category: SliderCategoryModel = await this.categoryRep.findOne({
      where: { sliderCategoryName: dto.sliderCategoryName },
    });
    if (category) {
      throw new CategoryExistErrorResponse();
    }

    try {
      return await this.categoryRep.create(dto);
    } catch (e) {
      throw new SliderErrorDbResponse(e);
    }
  }

  //PATCH
  /**update category information by ID */
  async updateCategory(dto: UpdateCategoryDto): Promise<SliderCategoryModel> {
    const category: SliderCategoryModel = await this.categoryRep.findByPk(dto.categoryId);

    if (!category) {
      throw new CategoryIdExceptionResponse();
    }

    try {
      await category.update(dto);
      return category;
    } catch (e) {
      throw new SliderUpdateDbErrorResponse(e);
    }
  }

  //GET
  /**get full information about category by ID */
  async getCategory(id: number): Promise<GetCategoryIntf> {
    const category: SliderCategoryModel = await this.categoryRep.findByPk(id);
    if (!category) {
      throw new CategoryIdExceptionResponse();
    }
    return { sliderCategoryName: category.sliderCategoryName };
  }

  /**get category for paggination */
  async getCategoryForPage(
    page: number,
    per_page: number,
    filterCategory: FilterCategoryDto
  ): Promise<SliderCategoryModel | GetForPageIntf<SliderCategoryModel>> {
    const offset: number = (page - 1) * per_page;
    return await this.categoryRep
      .findAndCountAll({
        limit: per_page,
        offset: offset,
        where: { ...filterCategory },
        attributes: ['id', 'sliderCategoryName'],
        order: ['createdAt'],
      })
      .then(({ rows, count }) => ({
        current_page: page,
        total_pages: Math.ceil(count / per_page),
        count: count,
        rows: rows,
      }));
  }

  //DELETE
  /**delete category, group, slider by category ID's */
  async deleteCategory(dto: DeleteCategoryDto): Promise<number[]> {
    //Let's find the category together with the related data(groups, sliders)
    const delCategories: SliderCategoryModel[] | null = await this.categoryRep.findAll({
      where: { id: dto.categories_id },
      include: {
        model: SliderGroupModel,
        as: 'sliderGroup',
        include: [
          {
            model: SliderModel,
            as: 'slider',
          },
        ],
      },
    });

    if (delCategories.length === 0) {
      throw new CategoryIdExceptionResponse();
    }

    try {
      await this.categoryRep.destroy({
        where: {
          id: dto.categories_id,
        },
      });

      return dto.categories_id;
    } catch (error) {
      throw new SliderDeleteErrorResponse(error);
    }
  }
}
