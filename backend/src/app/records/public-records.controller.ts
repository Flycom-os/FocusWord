import {
  Controller,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { ApiOkResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('public records')
@Controller('public/records')
export class PublicRecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List published records' })
  @ApiOkResponse({ description: 'Published records list.' })
  findPublished(@Query('search') search?: string) {
    return this.recordsService.findPublished(search);
  }

  @Get('slug/:slug')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a public record by slug' })
  @ApiOkResponse({ description: 'The requested record.' })
  async findOneBySlug(@Param('slug') slug: string) {
    const record = await this.recordsService.findOneBySlug(slug);

    if (!record || record.status !== 'published') {
      throw new NotFoundException('Record not found');
    }

    return record;
  }
}
