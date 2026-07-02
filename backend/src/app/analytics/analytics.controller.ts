import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { CreateAnalyticsEntryDto } from '../dto/analytics/create-analytics.dto';
import { UpdateAnalyticsEntryDto } from '../dto/analytics/update-analytics.dto';
import { AnalyticsFilterDto } from '../dto/analytics/analytics-filter.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a page view (public or user view)' })
  @ApiCreatedResponse({ description: 'The analytics entry has been successfully created/incremented.' })
  create(@Body() dto: CreateAnalyticsEntryDto) {
    return this.analyticsService.create(dto);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('analytics:0')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get aggregated analytics stats' })
  @ApiOkResponse({ description: 'Aggregated analytics stats.' })
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getStats(startDate, endDate);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('analytics:0')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a single analytics entry' })
  findOne(@Param('id') id: string) {
    return this.analyticsService.findById(+id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('analytics:1')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateAnalyticsEntryDto) {
    return this.analyticsService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('analytics:2')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.analyticsService.delete(+id);
  }

  @Get(':id/referrers')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('analytics:0')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  getReferrers(@Param('id') id: string) {
    return this.analyticsService.getReferrers(+id);
  }

  @Post(':id/referrers')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a referrer URL view to an entry' })
  addReferrer(
    @Param('id') id: string,
    @Body('referrerUrl') referrerUrl: string,
  ) {
    return this.analyticsService.addReferrer(+id, referrerUrl);
  }

  @Get()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @HasPermission('analytics:0')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() filterDto: AnalyticsFilterDto) {
    return this.analyticsService.findAll(filterDto);
  }
}
