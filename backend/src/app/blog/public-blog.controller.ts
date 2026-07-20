import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('public blog')
@Controller('public/blog')
export class PublicBlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List published blog posts' })
  @ApiOkResponse({ description: 'Published blog posts list.' })
  findPublished(@Query('search') search?: string) {
    return this.blogService.findPublished(search);
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a public blog post by slug' })
  @ApiOkResponse({ description: 'The requested blog post.' })
  async findOneBySlug(@Param('slug') slug: string) {
    const post = await this.blogService.findOneBySlug(slug);
    if (!post || post.status !== 'published') {
      throw new NotFoundException('Blog post not found');
    }
    return post;
  }
}
