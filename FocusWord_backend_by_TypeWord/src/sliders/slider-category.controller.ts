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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { SliderCategoryService } from './slider-category.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoryExistErrorResponse } from './responses-dto/error-Conflict';
import {
  SliderDeleteErrorResponse,
  SliderErrorDbResponse,
  SliderUpdateDbErrorResponse,
} from './responses-dto/error-Server';
import { CategoryIdExceptionResponse } from './responses-dto/error-NotFound';
import { getCategoryDto, getCategoryForPagDto } from './responses-dto/get-Response.dto';
import { SliderCategoryModel } from './model/sliderCategory.model';
import { GetCategoryIntf } from './interface/slider.interface';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { FilterCategoryDto } from './filter/filter-category.dto';

@ApiTags('Категории слайдеров')
@Controller('sliders/categories')
export class SliderCategoryController {
  constructor(private categoryService: SliderCategoryService) {}

//POST
  //create new slider category*/
  @ApiOperation({ summary: 'Создание новой категории' })
  @ApiResponse({ status: 409, type: CategoryExistErrorResponse })
  @ApiResponse({ status: 500, type: SliderErrorDbResponse })
  @UsePipes(new ValidationPipe())
  @Post('/new_category')
  createCategory(@Body() dto: CreateCategoryDto): Promise<SliderCategoryModel> {
    return this.categoryService.createCategory(dto);
  }
//PATCH
  /**update category */
  @ApiOperation({ summary: 'Обновление категории' })
  @ApiResponse({ status: 404, type: CategoryIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderUpdateDbErrorResponse })
  @UsePipes(new ValidationPipe())
  @Patch('/update_category')
  updateCategory(@Body() dto: UpdateCategoryDto): Promise<SliderCategoryModel> {
    return this.categoryService.updateCategory(dto);
  }
//GET
  /**get information category */
  @ApiOperation({ summary: 'Получение информации о категории' })
  @ApiResponse({ status: 200, type: getCategoryDto })
  @ApiResponse({ status: 404, type: CategoryIdExceptionResponse })
  @Get('/get_category/:id')
  getCategories(@Param('id', new ParseIntPipe()) id: number): Promise<GetCategoryIntf>{
    return this.categoryService.getCategory(id);
  }

  /**get categories for paggination */
  @ApiOperation({ summary: 'Получение категорий для пагинации' })
  @ApiResponse({ status: 200, type: getCategoryForPagDto })
  @Get('/search_pagination/:current_page/:per_page')
  getCategoryForPage(
    @Param('current_page', new ParseIntPipe()) current_page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
    @Query() filterCategory: FilterCategoryDto,
  ): Promise<SliderCategoryModel | GetForPageIntf<SliderCategoryModel>> {
    return this.categoryService.getCategoryForPage(current_page, per_page, filterCategory);
  }

//DELETE
  /**delete one or more categories */
  @ApiOperation({ summary: 'Удаление категорий' })
  @ApiResponse({ status: 200, description: 'Возвращает массив удаляемых категорий' })
  @ApiResponse({ status: 404, type: CategoryIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderDeleteErrorResponse })
  @UsePipes(new ValidationPipe())
  @Delete('/delete_categories')
  deleteCategory(@Body() dto: DeleteCategoryDto):Promise<number[]> {
    return this.categoryService.deleteCategory(dto);
  }
}
