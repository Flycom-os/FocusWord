import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import {
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('public pages')
@Controller('public/pages')
export class PublicPagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List published pages' })
  @ApiOkResponse({ description: 'Published pages list.' })
  findPublished(@Query('search') search?: string) {
    return this.pagesService.findPublished(search);
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a public page by slug' })
  @ApiOkResponse({ description: 'The requested page.' })
  async findOneBySlug(@Param('slug') slug: string) {
    const page = await this.pagesService.findOneBySlug(slug);

    if (!page || page.status !== 'published') {
      throw new NotFoundException('Page not found');
    }

    return page;
  }
}
