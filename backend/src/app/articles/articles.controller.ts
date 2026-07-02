import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus, Query, Req,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiTags, ApiOperation,
} from '@nestjs/swagger';
import { CreateArticleDto } from '../dto/articles/create-article.dto';
import { CreateArticleDraftDto } from '../dto/articles/create-article-draft.dto';
import { PageAiCompleteDto } from '../dto/pages/page-ai-complete.dto';
import { ArticleFilterDto } from '../dto/articles/article-filter.dto';
import { UpdateArticleDto } from '../dto/articles/update-article.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiBearerAuth()
@ApiTags('articles')
@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @HasPermission('articles:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article' })
  @ApiCreatedResponse({ description: 'The article has been successfully created.' })
  async create(@Body() dto: CreateArticleDto, @Req() req: RequestWithUser) {
    dto.authorId = req.user.userId;
    return this.articlesService.create(dto);
  }

  @Post('draft')
  @HasPermission('articles:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an article draft with defaults' })
  @ApiCreatedResponse({ description: 'The article draft has been successfully created.' })
  async createDraft(@Body() dto: CreateArticleDraftDto, @Req() req: RequestWithUser) {
    dto.authorId = req.user.userId;
    return this.articlesService.createDraft(dto);
  }

  @Post('ai/complete')
  @HasPermission('articles:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate article content via AI helper' })
  @ApiOkResponse({ description: 'AI-generated content result.' })
  completeWithAi(@Body() dto: PageAiCompleteDto) {
    return this.articlesService.completeWithAi(dto.prompt, dto.content);
  }

  @Get()
  @HasPermission('articles:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of articles with optional filtering' })
  @ApiOkResponse({ description: 'A list of articles.' })
  findAll(@Query() filterDto: ArticleFilterDto) {
    return this.articlesService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('articles:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single article by ID' })
  @ApiOkResponse({ description: 'The requested article.' })
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(+id);
  }

  @Get('slug/:slug')
  @HasPermission('articles:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single article by slug' })
  @ApiOkResponse({ description: 'The requested article.' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.articlesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @HasPermission('articles:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing article' })
  @ApiOkResponse({ description: 'The article has been successfully updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(+id, dto);
  }

  @Delete(':id')
  @HasPermission('articles:2')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an article' })
  @ApiOkResponse({ description: 'The article has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(+id);
  }

  @Patch(':id/publish')
  @HasPermission('articles:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish an article' })
  @ApiOkResponse({ description: 'The article has been successfully published.' })
  publish(@Param('id') id: string) {
    return this.articlesService.publish(+id);
  }

  @Patch(':id/unpublish')
  @HasPermission('articles:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish an article' })
  @ApiOkResponse({ description: 'The article has been successfully unpublished.' })
  unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(+id);
  }
}
