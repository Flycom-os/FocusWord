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
import { CategoriesService } from './categories.service';

@Controller('api/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAllCategories(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string
  ) {
    try {
      return await this.categoriesService.findAll(page, limit, search);
    } catch (error) {
      throw new HttpException('Failed to fetch categories', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getCategoryById(@Param('id') id: string) {
    try {
      const category = await this.categoriesService.findById(parseInt(id));
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
      return await this.categoriesService.create(createCategoryDto);
    } catch (error) {
      throw new HttpException('Failed to create category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() updateCategoryDto: any) {
    try {
      return await this.categoriesService.update(parseInt(id), updateCategoryDto);
    } catch (error) {
      throw new HttpException('Failed to update category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    try {
      await this.categoriesService.delete(parseInt(id));
      return { message: 'Category deleted successfully' };
    } catch (error) {
      throw new HttpException('Failed to delete category', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
