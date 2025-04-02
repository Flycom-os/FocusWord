import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateGroupDto } from './dto/create-group.dto';
import { SliderGroupService } from './slider-group.service';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DeleteGroupDto } from './dto/delete-group.dto';
import { GroupExistErrorResponse } from './responses-dto/error-Conflict';
import { CategoryIdExceptionResponse, GroupIdExceptionResponse } from './responses-dto/error-NotFound';
import {
  SliderDeleteErrorResponse,
  SliderErrorDbResponse,
  SliderUpdateDbErrorResponse,
} from './responses-dto/error-Server';
import { SliderGroupModel } from './model/sliderGroup.model';
import { getGroupForPagDto } from './responses-dto/get-Response.dto';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { FilterGroupDto } from './filter/filter-group.dto';

@ApiTags('Группы слайдеров')
@Controller('sliders/groups')
export class SliderGroupController {
  constructor(private groupService: SliderGroupService) {}

//POST
  /**create new slider group */
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Создание новой группы слайдов' })
  @ApiResponse({ status: 201, type: SliderGroupModel })
  @ApiResponse({ status: 409, type: GroupExistErrorResponse })
  @ApiResponse({ status: 404, type: CategoryIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderErrorDbResponse })
  @Post('/new_group')
  createGroup(@Body() dto: CreateGroupDto): Promise<SliderGroupModel> {
    return this.groupService.createGroup(dto);
  }

//PATCH
  /**update information slider group by ID */
  @UsePipes(new ValidationPipe())
  @ApiOperation({ summary: 'Обновление группы слайдеров' })
  @ApiResponse({ status: 200, type: SliderGroupModel })
  @ApiResponse({ status: 404, type: CategoryIdExceptionResponse })
  @ApiResponse({ status: 404, type: GroupIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderUpdateDbErrorResponse })
  @Patch('/update_group')
  updateCategory(@Body() dto: UpdateGroupDto): Promise<SliderGroupModel> {
    return this.groupService.updateGroup(dto);
  }

//GET
  /**get information about one slider group */
  @ApiOperation({ summary: 'Получение информации о группе слайдеров' })
  @ApiResponse({ status: 200, type: SliderGroupModel })
  @ApiResponse({ status: 404, type: GroupIdExceptionResponse })
  @Get('/get_group/:id')
  getCategories(@Param('id', new ParseIntPipe()) id: number): Promise<SliderGroupModel>  {
    return this.groupService.getGroup(id);
  }

  /**get slider groups for paggination */
  @ApiOperation({ summary: 'Получение групп слайдеров для пагинации' })
  @ApiResponse({ status: 200, type: getGroupForPagDto })
  @Get('/search_group/:current_page/:per_page')
  getGroupForPage
  (
    @Param('current_page', new ParseIntPipe()) current_page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
    @Query() filterCategory: FilterGroupDto,
  ): Promise<SliderGroupModel | GetForPageIntf<SliderGroupModel>> {
    return this.groupService.getGroupForPage(current_page, per_page, filterCategory);
  }

//DELETE
  /**delete slider groups, slides by group ID's */
  @ApiOperation({ summary: 'Удаление группы слайдеров и привязанных слайдов' })
  @ApiResponse({ status: 200, description: 'Возвращает массив удаляемых групп' })
  @ApiResponse({ status: 404, type: GroupIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderDeleteErrorResponse })
  @UsePipes(new ValidationPipe())
  @Delete('/delete_groups')
  deleteCategory(@Body() dto: DeleteGroupDto): Promise<number[]> {
    return this.groupService.deleteGroup(dto);
  }
}
