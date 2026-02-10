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
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiQuery, // Import ApiQuery
} from '@nestjs/swagger';
import { CreatePageDto } from "../dto/pages/create-page.dto";
import { PageFilterDto } from "../dto/pages/page-filter.dto";
import { UpdatePageDto } from "../dto/pages/update-page.dto";

@ApiBearerAuth()
@ApiTags('pages')
@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard) // Apply guards at controller level
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @Roles('pages:2') // Only users with pages:2 can create pages
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new page' })
  @ApiCreatedResponse({ description: 'The page has been successfully created.' })
  async create(@Body() createPageDto: CreatePageDto, @Req() req: any) {
    // Optionally set authorId from the authenticated user
    createPageDto.authorId = req.user.userId;
    return this.pagesService.create(createPageDto);
  }

  // @Get()
  // @Roles('pages:0', 'pages:1', 'pages:2') // All roles can read/list pages
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Retrieve a list of pages with optional filtering' })
  // @ApiOkResponse({ description: 'A list of pages.' })
  // findAll(@Query() filterDto: PageFilterDto) {
  //   return this.pagesService.findAll(filterDto);
  // }

  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term for title or content' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Filter by page status (e.g., draft, published)' })
  @ApiQuery({ name: 'authorId', required: false, type: Number, description: 'Filter by author ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page', example: 10 })
  @Get()
  @Roles('pages:0', 'pages:1', 'pages:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of pages with optional filtering' })
  @ApiOkResponse({ description: 'A list of pages.' })
  findAll(@Query() filterDto: PageFilterDto) {
    return this.pagesService.findAll(filterDto);
  }

  @Get(':id')
  @Roles('pages:0', 'pages:1', 'pages:2') // All roles can read/list pages
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single page by ID' })
  @ApiOkResponse({ description: 'The requested page.' })
  findOne(@Param('id') id: string) {
    return this.pagesService.findOne(+id);
  }

  @Get('slug/:slug')
  @Roles('pages:0', 'pages:1', 'pages:2') // All roles can read/list pages
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single page by slug' })
  @ApiOkResponse({ description: 'The requested page.' })
  findOneBySlug(@Param('slug') slug: string) {
    return this.pagesService.findOneBySlug(slug);
  }

  @Patch(':id')
  @Roles('pages:1', 'pages:2') // Users with pages:1 or pages:2 can update pages
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing page' })
  @ApiOkResponse({ description: 'The page has been successfully updated.' })
  update(@Param('id') id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(+id, updatePageDto);
  }

  @Delete(':id')
  @Roles('pages:1', 'pages:2') // Users with pages:1 or pages:2 can delete pages
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a page' })
  @ApiOkResponse({ description: 'The page has been successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.pagesService.remove(+id);
  }

  @Patch(':id/publish')
  @Roles('pages:2') // Only users with pages:2 can publish pages
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Publish a page' })
  @ApiOkResponse({ description: 'The page has been successfully published.' })
  publish(@Param('id') id: string) {
    return this.pagesService.publish(+id);
  }

  @Patch(':id/unpublish')
  @Roles('pages:2') // Only users with pages:2 can unpublish pages
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unpublish a page' })
  @ApiOkResponse({ description: 'The page has been successfully unpublished.' })
  unpublish(@Param('id') id: string) {
    return this.pagesService.unpublish(+id);
  }
}
