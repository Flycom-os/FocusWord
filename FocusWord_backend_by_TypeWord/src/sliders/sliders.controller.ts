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
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpdateSliderDto } from './dto/update-slider.dto';
import { FilterSlidersDto } from './filter/filter-sliders.dto';
import { DeleteSliderDto } from './dto/delete-slider.dto';
import { SliderExistErrorResponse } from './responses-dto/error-Conflict';
import { GroupIdExceptionResponse, SliderIdExceptionResponse } from './responses-dto/error-NotFound';
import { FileIdExceptionResponse } from '../files/response-dto/error-NotFound';
import { UserNotFoundResponse } from '../users/responses/users.not-found.responses';
import {
  SliderDeleteErrorResponse,
  SliderErrorDbResponse,
  SliderUpdateDbErrorResponse,
} from './responses-dto/error-Server';
import { SliderModel } from './model/slide.model';
import { getSliderDto, getSliderForPagDto } from './responses-dto/get-Response.dto';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';

@ApiTags('Слайды')
@Controller('sliders')
export class SlidersController {
  constructor(private sliderService: SlidersService) {}

  //POST
  /**create new slide */
  @ApiOperation({ summary: 'Создание нового слайда' })
  @ApiResponse({ status: 500, type: SliderErrorDbResponse })
  @ApiResponse({ status: 201, type: SliderModel })
  @ApiResponse({ status: 404, type: GroupIdExceptionResponse })
  @ApiResponse({ status: 404, type: FileIdExceptionResponse })
  @ApiResponse({ status: 404, type: UserNotFoundResponse })
  @ApiResponse({ status: 409, type: SliderExistErrorResponse })
  @ApiResponse({ status: 500, type: SliderErrorDbResponse })
  @UsePipes(new ValidationPipe())
  @Post('/new_slider')
  createCategory(@Body() dto: CreateSliderDto): Promise<SliderModel> {
    return this.sliderService.createSlider(dto);
  }
  //PATCH
  /**update information about slide */
  @ApiOperation({ summary: 'Обновление слайда по айди' })
  @ApiResponse({ status: 200, type: SliderModel })
  @ApiResponse({ status: 404, type: SliderIdExceptionResponse })
  @ApiResponse({ status: 404, type: FileIdExceptionResponse })
  @ApiResponse({ status: 404, type: UserNotFoundResponse })
  @ApiResponse({ status: 404, type: GroupIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderUpdateDbErrorResponse })
  @UsePipes(new ValidationPipe())
  @Patch('/update_slider')
  updateCategory(@Body() dto: UpdateSliderDto): Promise<SliderModel> {
    return this.sliderService.updateSlider(dto);
  }
  //GET
  /**getting all information about slide */
  @ApiOperation({ summary: 'Получение информации о слайде' })
  @ApiResponse({ status: 200, type: getSliderDto })
  @ApiResponse({ status: 404, type: SliderIdExceptionResponse })
  @Get('/get_slider/:id')
  getCategories(@Param('id', new ParseIntPipe()) id: number): Promise<SliderModel> {
    return this.sliderService.getSlider(id);
  }

  /**getting slides for paggination */
  @ApiOperation({ summary: 'Получение слайдов для пагинации' })
  @ApiResponse({ status: 200, type: getSliderForPagDto })
  @ApiResponse({ status: 404, type: GroupIdExceptionResponse })
  @UsePipes(new ValidationPipe())
  @Get('/search_slider/:current_page/:per_page')
  getCategoryForPage(
    @Param('current_page', new ParseIntPipe()) current_page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
    @Query() sliderFilter: FilterSlidersDto,
  ): Promise<GetForPageIntf<SliderModel>> {
    return this.sliderService.getSliderForPage(current_page, per_page, sliderFilter);
  }

  //DELETE
  /**delete one or more slides */
  @ApiOperation({ summary: 'Удаление слайдов' })
  @ApiResponse({ status: 200, description: 'Возвращает массив удаляемых категорий' })
  @ApiResponse({ status: 404, type: SliderIdExceptionResponse })
  @ApiResponse({ status: 500, type: SliderDeleteErrorResponse })
  @UsePipes(new ValidationPipe())
  @Delete('/delete_slider')
  deleteCategory(@Body() dto: DeleteSliderDto): Promise<number[]> {
    return this.sliderService.deleteSlider(dto);
  }
}
