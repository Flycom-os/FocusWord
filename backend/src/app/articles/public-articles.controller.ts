import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('public articles')
@Controller('public/articles')
export class PublicArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List published articles' })
  @ApiOkResponse({ description: 'Published articles list.' })
  findPublished(@Query('search') search?: string) {
    return this.articlesService.findPublished(search);
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a public article by slug' })
  @ApiOkResponse({ description: 'The requested article.' })
  async findOneBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.findOneBySlug(slug);
    if (!article || article.status !== 'published') {
      throw new NotFoundException('Article not found');
    }
    return article;
  }
}
