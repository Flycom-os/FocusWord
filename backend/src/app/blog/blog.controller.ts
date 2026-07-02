import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseGuards, HttpCode, HttpStatus, Query, Req,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import {
  ApiBearerAuth, ApiCreatedResponse, ApiOkResponse,
  ApiTags, ApiOperation, ApiQuery,
} from '@nestjs/swagger';
import { CreateBlogPostDto } from '../dto/blog/create-blog-post.dto';
import { CreateBlogPostDraftDto } from '../dto/blog/create-blog-post-draft.dto';
import { PageAiCompleteDto } from '../dto/pages/page-ai-complete.dto';
import { BlogFilterDto } from '../dto/blog/blog-filter.dto';
import { UpdateBlogPostDto } from '../dto/blog/update-blog-post.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiBearerAuth()
@ApiTags('blog')
@Controller('blog')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post()
  @HasPermission('blog:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new blog post' })
  @ApiCreatedResponse({ description: 'The blog post has been successfully created.' })
  async create(@Body() dto: CreateBlogPostDto, @Req() req: RequestWithUser) {
    dto.authorId = req.user.userId;
    return this.blogService.create(dto);
  }

  @Post('draft')
  @HasPermission('blog:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a blog post draft with defaults' })
  @ApiCreatedResponse({ description: 'The blog post draft has been successfully created.' })
  async createDraft(@Body() dto: CreateBlogPostDraftDto, @Req() req: RequestWithUser) {
    dto.authorId = req.user.userId;
    return this.blogService.createDraft(dto);
  }

  @Post('ai/complete')
  @HasPermission('blog:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate blog post content via AI helper' })
  @ApiOkResponse({ description: 'AI-generated content result.' })
  completeWithAi(@Body() dto: PageAiCompleteDto) {
    return this.blogService.completeWithAi(dto.prompt, dto.content);
  }

  @Get()
  @HasPermission('blog:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of blog posts with optional filtering' })
  @ApiOkResponse({ description: 'A list of blog posts.' })
  findAll(@Query() filterDto: BlogFilterDto) {
    return this.blogService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('blog:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single blog post by ID' })
  @ApiOkResponse({ description: 'The requested blog post.' })
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Get('slug/:slug')
  @HasPermission('blog:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single blog post by slug' })
  @ApiOkResponse({ description: 'The requested blog post.' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.blogService.findOneBySlug(slug);
  }

  @Patch(':id')
  @HasPermission('blog:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing blog post' })
  @ApiOkResponse({ description: 'The blog post has been successfully updated.' })
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(+id, dto);
  }

  @Delete(':id')
  @HasPermission('blog:2')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiOkResponse({ description: 'The blog post has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }

  @Patch(':id/publish')
  @HasPermission('blog:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a blog post' })
  @ApiOkResponse({ description: 'The blog post has been successfully published.' })
  publish(@Param('id') id: string) {
    return this.blogService.publish(+id);
  }

  @Patch(':id/unpublish')
  @HasPermission('blog:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a blog post' })
  @ApiOkResponse({ description: 'The blog post has been successfully unpublished.' })
  unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(+id);
  }
}
