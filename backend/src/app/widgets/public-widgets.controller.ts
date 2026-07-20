import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('public widgets')
@Controller('public/widgets')
export class PublicWidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List active widgets' })
  @ApiOkResponse({ description: 'Active widgets list.' })
  async findActive(@Query('type') type?: string) {
    const response = await this.widgetsService.findAll({
      page: 1,
      limit: 100,
      type,
      status: 'active',
    });
    return response.data;
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a public widget by slug' })
  @ApiOkResponse({ description: 'The requested widget.' })
  async findOneBySlug(@Param('slug') slug: string) {
    const widget = await this.widgetsService.findOneBySlug(slug);

    if (!widget || widget.status !== 'active') {
      throw new NotFoundException(
        `Widget with slug "${slug}" not found or inactive`,
      );
    }

    return widget;
  }
}
