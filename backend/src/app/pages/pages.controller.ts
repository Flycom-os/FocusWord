import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CreatePageDto } from "../dto/pages/create-page.dto";
import { CreatePageDraftDto } from "../dto/pages/create-page-draft.dto";
import { PageAiCompleteDto } from "../dto/pages/page-ai-complete.dto";
import { PageFilterDto } from "../dto/pages/page-filter.dto";
import { UpdatePageDto } from "../dto/pages/update-page.dto";
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiBearerAuth()
@ApiTags('pages')
@Controller('pages')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HasPermission('pages:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new page' })
  @ApiCreatedResponse({ description: 'The page has been successfully created.' })
  async create(@Body() createPageDto: CreatePageDto, @Req() req: RequestWithUser) {
    createPageDto.authorId = req.user.userId;
    return this.pagesService.create(createPageDto);
  }

  @Post('draft')
  @HasPermission('pages:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a page draft with defaults' })
  @ApiCreatedResponse({ description: 'The page draft has been successfully created.' })
  async createDraft(@Body() createPageDraftDto: CreatePageDraftDto, @Req() req: RequestWithUser) {
    createPageDraftDto.authorId = req.user.userId;
    return this.pagesService.createDraft(createPageDraftDto);
  }

  @Post('ai/complete')
  @HasPermission('pages:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate page content via AI helper' })
  @ApiOkResponse({ description: 'AI-generated content result.' })
  completeWithAi(@Body() dto: PageAiCompleteDto) {
    return this.pagesService.completeWithAi(dto.prompt, dto.content);
  }

  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for title or content' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by page status (e.g., draft, published)' })
  @ApiQuery({ name: 'authorId', required: false, type: Number, description: 'Filter by author ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @Get()
  @HasPermission('pages:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of pages with optional filtering' })
  @ApiOkResponse({ description: 'A list of pages.' })
  findAll(@Query() filterDto: PageFilterDto) {
    return this.pagesService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('pages:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single page by ID' })
  @ApiOkResponse({ description: 'The requested page.' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(+id);
  }

  @Get('slug/:slug')
  @HasPermission('pages:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single page by slug' })
  @ApiOkResponse({ description: 'The requested page.' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.pagesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @HasPermission('pages:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing page' })
  @ApiOkResponse({ description: 'The page has been successfully updated.' })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(+id, updatePageDto);
  }

  @Delete(':id')
  @HasPermission('pages:2')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page' })
  @ApiOkResponse({ description: 'The page has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(+id);
  }

  @Patch(':id/publish')
  @HasPermission('pages:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a page' })
  @ApiOkResponse({ description: 'The page has been successfully published.' })
  publish(@Param('id') id: string) {
    return this.pagesService.publish(+id);
  }

  @Patch(':id/unpublish')
  @HasPermission('pages:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a page' })
  @ApiOkResponse({ description: 'The page has been successfully unpublished.' })
  unpublish(@Param('id') id: string) {
    return this.pagesService.unpublish(+id);
  }
}
