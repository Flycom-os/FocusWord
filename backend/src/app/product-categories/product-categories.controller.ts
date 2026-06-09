import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Product Categories')
@Controller('product-categories')
export class ProductCategoriesController {
  constructor(private readonly service: ProductCategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a product category' })
  create(@Body() body: { name: string; slug: string; description?: string; parentId?: number; status?: string }) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product categories' })
  findAll(@Query() query: { page?: number; limit?: number; search?: string }) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product category by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product category' })
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; slug?: string; description?: string; parentId?: number; status?: string }
  ) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product category' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
