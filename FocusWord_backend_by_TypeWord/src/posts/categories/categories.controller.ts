import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { PostsCategory } from './category.model';
import { CreatePostCategoryDto } from './dto/create-post-category.dto';
import { UpdatePostCategoryDto } from './dto/update-post-category.dto';
import { RolesGuard } from '../../roles/roles.guard';
import { RoleProperties } from '../../roles/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { CategoryDeleteOkResponse } from './responses/categories-ok.responses';
import { ForbiddenAccessExceptionResponse } from '../../roles/responses/roles.forbidden.responses';
import {
  CategoryDeleteForbiddenResponse,
  CategoryUpdateForbiddenResponse,
} from './responses/categories.forbidden.responses';
import { CategoriesNotFoundResponse } from './responses/categories.not-found.responses';
import { CategoriesConflictResponse } from './responses/categories.conflict.responses';
import { UnauthorizedExceptionResponse } from '../../auth/responses/auth.unauthorized.responses';

@ApiTags('Категории постов')
@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject(CategoriesService)
    private categoryService: CategoriesService,
  ) {}

//GET
  /**
   * 
   * get all categories posts
   */
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/posts/categories')
  @ApiOperation({ summary: 'Получение всех категорий постов' })
  @ApiOkResponse({ type: [PostsCategory] })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  async getPostsCategories(): Promise<PostsCategory[]> {
    return await this.categoryService.getCategories();
  }

//POST
/**
 * 
 * create new category posts
 */
  @RoleProperties({ admin_panel_access: true, posts_categories_manage: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание новой категории постов' })
  @ApiOkResponse({ type: PostsCategory })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @ApiConflictResponse({ description: 'Error: Conflict', type: CategoriesConflictResponse })
  @Post('/posts/new-category')
  async createPostCategory(@Body() dto: CreatePostCategoryDto): Promise<PostsCategory> {
    return await this.categoryService.createCategory(dto);
  }

//PATCH
/** 
 * update category posts
*/
  @RoleProperties({ admin_panel_access: true, posts_categories_manage: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление категории постов' })
  @ApiOkResponse({ type: PostsCategory })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: CategoryUpdateForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: CategoriesNotFoundResponse })
  @ApiConflictResponse({ description: 'Error: Conflict', type: CategoriesConflictResponse })
  @Patch('/posts/update-category/:id')
  async updatePostCategory(
    @Param('id', ParseIntPipe) category_id: number,
    @Body() dto: UpdatePostCategoryDto,
  ): Promise<PostsCategory> {
    return await this.categoryService.updateCategory(category_id, dto);
  }

//DELETE
  /**
   * delete one or more categories posts
   * 
   */
  @RoleProperties({ admin_panel_access: true, posts_categories_manage: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление категории постов' })
  @ApiOkResponse({ type: CategoryDeleteOkResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: CategoryDeleteForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: NotFound', type: CategoriesNotFoundResponse })
  @Delete('/posts/delete-categories/:ids')
  async deletePostCategory(
    @Param('ids', new ParseArrayPipe({ items: Number })) ids: number[],
  ): Promise<CategoryDeleteOkResponse> {
    return await this.categoryService.deleteCategories(ids);
  }
}
