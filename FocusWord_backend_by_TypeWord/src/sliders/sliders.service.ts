import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SliderModel } from './model/slide.model';
import { UsersService } from '../users/users.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { FilterSlidersDto } from './filter/filter-sliders.dto';
import { DeleteSliderDto } from './dto/delete-slider.dto';
import { User } from '../users/user.model';
import { SliderGroupModel } from './model/sliderGroup.model';
import { MiniatureModel } from '../files/miniature.model';
import { Op } from 'sequelize';
import { SliderExistErrorResponse } from './responses-dto/error-Conflict';
import { GroupIdExceptionResponse, SliderIdExceptionResponse } from './responses-dto/error-NotFound';
import { FileIdExceptionResponse } from '../files/response-dto/error-NotFound';
import { UsersNotFoundResponse } from '../users/responses/users.not-found.responses';
import {
  SliderDeleteErrorResponse,
  SliderErrorDbResponse,
  SliderUpdateDbErrorResponse,
} from './responses-dto/error-Server';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { SliderGroupService } from './slider-group.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class SlidersService {
  constructor(
    @InjectModel(SliderModel) private sliderRep: typeof SliderModel,
    private userService: UsersService,
    private groupService: SliderGroupService,
    private fileService: FilesService,
  ) {}

  /**creating new slide */
  async createSlider(dto: CreateSliderDto): Promise<SliderModel> {
    //search for matches by name or position
    const query = {
      where: {
        [Op.or]: [
          {
            sliderName: dto.sliderName,
          },
          {
            position: dto.position !== undefined ? dto.position : null,
          },
        ],
      },
    };

    const slider: SliderModel = await this.sliderRep.findOne(query);
    if (slider) {
      throw new SliderExistErrorResponse();
    }

    const group: SliderGroupModel = await this.groupService.getSliderGroupById(dto.groupId);
    if (!group) {
      throw new GroupIdExceptionResponse();
    }

    const file: MiniatureModel = await this.fileService.getMiniatureById(dto.miniatureId);
    if (!file) {
      throw new FileIdExceptionResponse();
    }

    const user: User = await this.userService.getUserById(dto.userId);
    if (!user) {
      throw new UsersNotFoundResponse(dto.userId);
    }

    try {
      return await this.sliderRep.create(dto);
    } catch (e) {
      throw new SliderErrorDbResponse(e);
    }
  }

  /**update information about slide */
  async updateSlider(dto: UpdateSliderDto): Promise<SliderModel> {
    //check for dto fields in the database
    const slider: SliderModel = await this.sliderRep.findByPk(dto.id);
    if (!slider) {
      throw new SliderIdExceptionResponse();
    }
    if (dto.fileId) {
      const file: MiniatureModel = await this.fileService.getMiniatureById(dto.fileId);
      if (!file) {
        throw new FileIdExceptionResponse();
      }
    }
    if (dto.userId) {
      const user: User = await this.userService.getUserById(dto.userId);
      if (!user) {
        throw new UsersNotFoundResponse(dto.userId);
      }
    }
    if (dto.groupId) {
      const group: SliderGroupModel = await this.groupService.getSliderGroupById(dto.groupId);
      if (!group) {
        throw new GroupIdExceptionResponse();
      }
    }

    /**will update the position of an existing slide, in case another slide is updated */
    if (dto.position) {
      const slideOnOldPosition: SliderModel = await this.sliderRep.findOne({
        where: {
          groupId: dto.groupId || slider.groupId,
          position: dto.position,
        },
      });
      if (slideOnOldPosition) {
        await slideOnOldPosition.update({ position: slider.position });
      }
    }

    try {
      await slider.update(dto);
      return slider;
    } catch (e) {
      throw new SliderUpdateDbErrorResponse(e);
    }
  }

  /**get information about slide by ID */
  async getSlider(id: number): Promise<SliderModel> {
    const slider: SliderModel = await this.sliderRep.findByPk(id, {
      include: [
        {
          model: MiniatureModel,
          as: 'miniature',
          attributes: ['filepath'],
        },
      ],
      attributes: { exclude: ['miniatureId'] },
    });
    if (!slider) {
      throw new SliderIdExceptionResponse();
    }
    return slider;
  }

  /**get slides for page  */
  async getSliderForPage(
    page: number,
    per_page: number,
    sliderFilter: FilterSlidersDto,
  ): Promise<GetForPageIntf<SliderModel>> {
    const group: SliderGroupModel = await this.groupService.getSliderGroupById(sliderFilter.sliderGroupId);
    if (!group) {
      throw new GroupIdExceptionResponse();
    }

    const offset: number = (page - 1) * per_page;
    return await this.sliderRep
      .findAndCountAll({
        limit: per_page,
        offset: offset,
        where: { groupId: sliderFilter.sliderGroupId },
        attributes: { exclude: ['miniatureId'] },
        order: ['createdAt'],
        include: [
          {
            model: MiniatureModel,
            as: 'miniature',
            attributes: ['filepath'],
          },
        ],
      })
      .then(({ rows, count }) => ({
        current_page: page,
        total_pages: Math.ceil(count / per_page),
        count: count,
        rows: rows,
      }));
  }

  /**delete slide by ID's */
  async deleteSlider(dto: DeleteSliderDto): Promise<number[]> {
    const delSlider: SliderModel[] = await this.sliderRep.findAll({
      where: { id: dto.sliders_id },
    });

    if (delSlider.length === 0) {
      throw new SliderIdExceptionResponse();
    }

    try {
      await this.sliderRep.destroy({
        where: {
          id: dto.sliders_id,
        },
      });

      return dto.sliders_id;
    } catch (e) {
      throw new SliderDeleteErrorResponse(e);
    }
  }
}
