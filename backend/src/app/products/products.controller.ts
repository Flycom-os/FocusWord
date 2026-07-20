import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create product' })
  create(
    @Body()
    body: {
      name: string;
      slug: string;
      description?: string;
      price: number;
      categoryId?: number;
      status?: string;
    },
  ) {
    return this.service.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: number;
    },
  ) {
    return this.service.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      categoryId?: number;
      status?: string;
    },
  ) {
    return this.service.update(Number(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product' })
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }

  // === REVIEWS ===
  @Post(':id/reviews')
  @ApiOperation({ summary: 'Add review to product' })
  addReview(
    @Param('id') id: string,
    @Body()
    body: { name: string; email: string; message: string; rating: number },
  ) {
    return this.service.addReview(Number(id), body);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get product reviews by ID' })
  getReviews(@Param('id') id: string) {
    return this.service.getReviews(Number(id));
  }
}
