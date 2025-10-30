import {
  Body,
  Controller, Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe, Patch, Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse, ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { RoleProperties } from '../roles/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../roles/roles.guard';
import {
  PagesResponse,
  PostByIdResponse,
  PostsDeletedResponse,
  PostsPublishedResponse,
} from './responses/posts.ok.responses';
import { UserId } from '../decorators/user-id.decorator';
import { CreatePostDraftDto } from './dto/create-post-draft.dto';
import { UpdatePostDraftDto } from './dto/update-post-draft.dto';
import { MultiplePostsDto } from './dto/multiple-posts.dto';
import { NotFoundResponse } from '../responses/not-found.response';
import { ForbiddenResponse } from '../responses/forbidden.response';
import { BadRequestResponse } from '../responses/bad-request.response';
import { UnauthorizedResponse } from '../responses/unauthorized.response';
import { UnprocessableEntityResponse } from '../responses/validation.response';

@ApiTags('Посты')
@Controller('posts')
export class PostsController {
  constructor(
    @Inject(PostsService)
    private postsService: PostsService,
  ) {}

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение постов с пагинацией' })
  @ApiOkResponse({ description: 'Success', type: PagesResponse })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiNotFoundResponse( { description: 'Error: Not Found', type: NotFoundResponse } )
  @Get('/posts-pagination/:current_page/:per_page')
  async getPostsPagination(
    @Param('current_page', new ParseIntPipe()) page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
  ): Promise<PagesResponse> {
    return await this.postsService.getPostsPagination(page, per_page);
  }

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение поста по уникальному идентификатору' })
  @ApiOkResponse({ description: 'Success', type: PostByIdResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Get('/posts/:id')
  async getPostById(@Param('id') id: number): Promise<PostByIdResponse> {
    return await this.postsService.getPostById(id);
  }

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, save_posts: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание нового поста без публикации' })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Post('/save')
  async savePost(@Body() dto: CreatePostDraftDto, @UserId() user_id: number): Promise<PostByIdResponse> {
    return await this.postsService.createSavePost(dto, user_id);
  }

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, publish_posts: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание нового поста с последующей публикацией' })
  @ApiCreatedResponse({ description: 'Created', type: PostByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Post('/publish')
  async publishPost(@Body() dto: CreatePostDraftDto, @UserId() user_id: number): Promise<PostByIdResponse> {
    return await this.postsService.createPublishPost(dto, user_id);
  }

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, publish_posts: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление поста с последующей публикацией' })
  @ApiOkResponse({ description: 'Success', type: PostByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Patch('/update-publish/:id')
  async updatePublishPost(
    @Param('id', ParseIntPipe) post_id: number,
    @Body() dto: UpdatePostDraftDto,
    @UserId() user_id: number,
  ): Promise<PostByIdResponse> {
    return await this.postsService.updatePublishPost(dto, post_id, user_id);
  }

  @RoleProperties({ admin_panel_access: true, publish_posts: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление черновика поста' })
  @ApiOkResponse({ description: 'Success', type: PostByIdResponse })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Patch('/update-save/:id')
  async updateSavePost(
    @Param('id', ParseIntPipe) draft_id: number,
    @Body() dto: UpdatePostDraftDto,
    @UserId() user_id: number,
  ): Promise<PostByIdResponse> {
    return await this.postsService.updateSavePost(dto, draft_id, user_id);
  }

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, publish_posts: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Публикация постов' })
  @ApiOkResponse({ description: 'Success', type: PostsPublishedResponse })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Patch('/multiple-publish')
  async updatePublishPosts(
    @Body() dto: MultiplePostsDto,
    @UserId() user_id: number,
  ): Promise<PostsPublishedResponse> {
    return await this.postsService.forwardUpdatePosts(dto, user_id);
  }

  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, save_posts: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление постов' })
  @ApiOkResponse({ description: 'Success', type: PostsDeletedResponse })
  @ApiBadRequestResponse({ description: 'Error: Bad Request', type: BadRequestResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: NotFoundResponse })
  @ApiUnprocessableEntityResponse({ description: 'Error: Unprocessable Entity', type: UnprocessableEntityResponse })
  @Delete('/multiple-delete')
  async deletePostDrafts(
    @Body() dto: MultiplePostsDto,
  ): Promise<PostsDeletedResponse> {
    return await this.postsService.deletePosts(dto);
  }
}
