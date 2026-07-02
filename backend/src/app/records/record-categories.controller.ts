import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  Query,
  HttpStatus,
  HttpException
} from '@nestjs/common';
import { RecordCategoriesService } from './record-categories.service';

@Controller('api/records/categories')
export class RecordCategoriesController {
  constructor(private readonly recordCategoriesService: RecordCategoriesService) {}

  @Get()
  async getAllCategories(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ) {
    try {
      return await this.recordCategoriesService.findAll(page, limit, search);
    } catch (error) {
      throw new HttpException('Failed to fetch record categories', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    try {
      const category = await this.recordCategoriesService.findById(parseInt(id));
      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }
      return category;
    } catch (error) {
      throw new HttpException('Failed to fetch category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async createCategory(@Body() createCategoryDto: any) {
    try {
      return await this.recordCategoriesService.create(createCategoryDto);
    } catch (error) {
      throw new HttpException('Failed to create record category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: any) {
    try {
      return await this.recordCategoriesService.update(parseInt(id), updateCategoryDto);
    } catch (error) {
      throw new HttpException('Failed to update record category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.recordCategoriesService.delete(parseInt(id));
      return { message: 'Record category deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete record category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
