import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
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

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a public page by slug' })
  @ApiOkResponse({ description: 'The requested page.' })
  async findOneBySlug(@Param('slug') slug: string) {
    console.log(`[PublicPagesController] Looking for page with slug: "${slug}"`);
    
    const page = await this.pagesService.findOneBySlug(slug);
    
    console.log(`[PublicPagesController] Found page:`, page ? { id: page.id, slug: page.slug, title: page.title, status: page.status } : 'null');
    
    // Return 404 if page not found or not published
    if (!page || page.status !== 'published') {
      console.log(`[PublicPagesController] Page not found or not published, returning 404`);
      throw new NotFoundException('Page not found');
    }
    
    console.log(`[PublicPagesController] Returning page: ${page.title}`);
    return page;
  }
}
