import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { SlidersService } from './sliders.service';
import { CreateSliderDto } from '../dto/sliders/create-slider.dto';
import { UpdateSliderDto } from '../dto/sliders/update-slider.dto';
import { CreateSlideDto } from '../dto/sliders/create-slide.dto';
import { UpdateSlideDto } from '../dto/sliders/update-slide.dto';
import { QuerySliderDto } from '../dto/sliders/query-slider.dto';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';

@ApiBearerAuth()
@ApiTags('sliders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  // Slider endpoints
  @Post()
  @HasPermission('sliders:2')
  @ApiOperation({ summary: 'Create a new slider' })
  @ApiResponse({ status: 201, description: 'The slider has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createSlider(@Body() createSliderDto: CreateSliderDto) {
    return this.slidersService.createSlider(createSliderDto);
  }

  @Get()
  @HasPermission('sliders:0')
  @ApiOperation({ summary: 'Retrieve all sliders with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for slider name or description' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of sliders.',
    schema: {
      properties: {
        data: { type: 'array', items: { '$ref': '#/components/schemas/Slider' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllSliders(@Query() query: QuerySliderDto) {
    return this.slidersService.findAllSliders(query);
  }

  @Get(':id')
  @HasPermission('sliders:0')
  @ApiOperation({ summary: 'Retrieve a single slider by ID' })
  @ApiResponse({ status: 200, description: 'The slider.' })
  @ApiResponse({ status: 404, description: 'Slider not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOneSlider(@Param('id') id: string) {
    return this.slidersService.findOneSlider(+id);
  }

  @Patch(':id')
  @HasPermission('sliders:1')
  @ApiOperation({ summary: 'Update a slider by ID' })
  @ApiResponse({ status: 200, description: 'The slider has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Slider not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateSlider(@Param('id') id: string, @Body() updateSliderDto: UpdateSliderDto) {
    return this.slidersService.updateSlider(+id, updateSliderDto);
  }

  @Delete(':id')
  @HasPermission('sliders:2')
  @ApiOperation({ summary: 'Delete a slider by ID' })
  @ApiResponse({ status: 200, description: 'The slider has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Slider not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  removeSlider(@Param('id') id: string) {
    return this.slidersService.removeSlider(+id);
  }

  // Slide endpoints for a specific slider
  @Post(':sliderId/slides')
  @HasPermission('sliders:2')
  @ApiOperation({ summary: 'Create a new slide for a specific slider' })
  @ApiResponse({ status: 201, description: 'The slide has been successfully created.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createSlide(@Param('sliderId') sliderId: string, @Body() createSlideDto: CreateSlideDto) {
    return this.slidersService.createSlide(+sliderId, createSlideDto);
  }

  @Get(':sliderId/slides')
  @HasPermission('sliders:0')
  @ApiOperation({ summary: 'Retrieve all slides for a specific slider with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for slide title or description' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of slides for the slider.',
    schema: {
      properties: {
        data: { type: 'array', items: { '$ref': '#/components/schemas/Slide' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findAllSlides(@Param('sliderId') sliderId: string, @Query() query: QuerySliderDto) {
    return this.slidersService.findAllSlides(+sliderId, query);
  }

  @Get(':sliderId/slides/:slideId')
  @HasPermission('sliders:0')
  @ApiOperation({ summary: 'Retrieve a single slide by ID for a specific slider' })
  @ApiResponse({ status: 200, description: 'The slide.' })
  @ApiResponse({ status: 404, description: 'Slide not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  findOneSlide(@Param('slideId') slideId: string) {
    return this.slidersService.findOneSlide(+slideId);
  }

  @Patch(':sliderId/slides/:slideId')
  @HasPermission('sliders:1')
  @ApiOperation({ summary: 'Update a slide by ID for a specific slider' })
  @ApiResponse({ status: 200, description: 'The slide has been successfully updated.' })
  @ApiResponse({ status: 404, description: 'Slide not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateSlide(@Param('slideId') slideId: string, @Body() updateSlideDto: UpdateSlideDto) {
    return this.slidersService.updateSlide(+slideId, updateSlideDto);
  }

  @Delete(':sliderId/slides/:slideId')
  @HasPermission('sliders:2')
  @ApiOperation({ summary: 'Delete a slide by ID for a specific slider' })
  @ApiResponse({ status: 200, description: 'The slide has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Slide not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  removeSlide(@Param('slideId') slideId: string) {
    return this.slidersService.removeSlide(+slideId);
  }
}
