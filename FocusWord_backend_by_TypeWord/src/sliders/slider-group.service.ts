import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SliderGroupModel } from './model/sliderGroup.model';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DeleteGroupDto } from './dto/delete-group.dto';
import { SliderCategoryModel } from './model/sliderCategory.model';
import { SliderModel } from './model/slide.model';
import { GroupExistErrorResponse } from './responses-dto/error-Conflict';
import { CategoryIdExceptionResponse, GroupIdExceptionResponse } from './responses-dto/error-NotFound';
import {
  SliderDeleteErrorResponse,
  SliderErrorDbResponse,
  SliderUpdateDbErrorResponse,
} from './responses-dto/error-Server';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { FilterGroupDto } from './filter/filter-group.dto';

@Injectable()
export class SliderGroupService {
  constructor(
    @InjectModel(SliderGroupModel) private groupRep: typeof SliderGroupModel,
    @InjectModel(SliderCategoryModel) private categoryRep: typeof SliderCategoryModel,
  ) {}

  async getSliderGroupById(id: number) {
    return await this.groupRep.findByPk(id);
  }

  /**create new slider group */
  async createGroup(dto: CreateGroupDto): Promise<SliderGroupModel> {
    const group: SliderGroupModel = await this.groupRep.findOne({
      where: { sliderGroupName: dto.sliderGroupName },
    });
    const category: SliderCategoryModel = await this.categoryRep.findByPk(dto.categoryId);
    if (group) {
      throw new GroupExistErrorResponse();
    } else if (!category) {
      throw new CategoryIdExceptionResponse();
    }

    try {
      return await this.groupRep.create(dto);
    } catch (e) {
      throw new SliderErrorDbResponse(e);
    }
  }

  /**update information about slider group by ID */
  async updateGroup(dto: UpdateGroupDto): Promise<SliderGroupModel> {
    const group: SliderGroupModel = await this.groupRep.findByPk(dto.groupId);

    if (dto.categoryId) {
      const category: SliderCategoryModel = await this.categoryRep.findByPk(dto.categoryId);
      if (!category) {
        throw new CategoryIdExceptionResponse();
      }
    }
    if (!group) {
      throw new GroupIdExceptionResponse();
    }

    try {
      await group.update(dto);
    } catch (e) {
      throw new SliderUpdateDbErrorResponse(e);
    }

    return group;
  }

  /**get slider group by ID */
  async getGroup(id: number): Promise<SliderGroupModel> {
    const group: SliderGroupModel = await this.groupRep.findByPk(id);
    if (!group) {
      throw new GroupIdExceptionResponse();
    }
    return group;
  }

  /**get slider group for paggination */
  async getGroupForPage(
    page: number, 
    per_page: number, 
    filterGroup: FilterGroupDto
    ): Promise<SliderGroupModel | GetForPageIntf<SliderGroupModel>> {
    const offset: number = (page - 1) * per_page;
    return await this.groupRep
      .findAndCountAll({
        limit: per_page,
        offset: offset,
        where: { ...filterGroup },
        order: ['createdAt'],
      })
      .then(({ rows, count }) => ({
        current_page: page,
        total_pages: Math.ceil(count / per_page),
        count: count,
        rows: rows,
      }));
  }

  /**delete slider groups, sliders by group ID's  */
  async deleteGroup(dto: DeleteGroupDto): Promise<number[]> {
    const delGroups: SliderGroupModel[] = await this.groupRep.findAll({
      where: { id: dto.group_id },
      include: {
        model: SliderModel,
        as: 'slider',
      },
    });

    if (delGroups.length === 0) {
      throw new GroupIdExceptionResponse();
    }

    try {
      await this.groupRep.destroy({
        where: {
          id: dto.group_id,
        },
      });

      return dto.group_id;
    } catch (e) {
      throw new SliderDeleteErrorResponse(e);
    }
  }
}
