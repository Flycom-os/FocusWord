import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { SeoService, SEOSettings } from './seo.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('seo')
@Controller('api/seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Get('settings')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get SEO site settings' })
  getSettings() {
    return this.seoService.getSettings();
  }

  @Post('settings')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('settings:2') // Or settings permission
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save SEO site settings' })
  async saveSettings(@Body() settings: SEOSettings) {
    await this.seoService.saveSettings(settings);
    return { message: 'SEO settings updated successfully' };
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get robots.txt' })
  getRobotsTxt() {
    return this.seoService.generateRobotsTxt();
  }

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get sitemap.xml' })
  getSitemap() {
    return this.seoService.generateSitemap();
  }

  @Get('page-meta/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get SEO metadata for a page/entity by slug' })
  getPageMeta(@Param('slug') slug: string) {
    return this.seoService.getPageMeta(slug);
  }
}
