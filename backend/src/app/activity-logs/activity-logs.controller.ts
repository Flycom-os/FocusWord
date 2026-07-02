import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { CreateActivityLogDto } from '../dto/activity-logs/create-activity-log.dto';
import { ActivityLogFilterDto } from '../dto/activity-logs/activity-log-filter.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('activity-logs')
@Controller('activity-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @HasPermission('activity-logs:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new activity log entry' })
  @ApiCreatedResponse({ description: 'The activity log has been successfully created.' })
  create(@Body() dto: CreateActivityLogDto) {
    return this.activityLogsService.create(dto);
  }

  @Get('stats')
  @HasPermission('activity-logs:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get stats on activity logs' })
  @ApiOkResponse({ description: 'Statistics on activity logs.' })
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activityLogsService.getStats(startDate, endDate);
  }

  @Get('action-types')
  @HasPermission('activity-logs:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of unique action types' })
  @ApiOkResponse({ description: 'List of action types.' })
  getActionTypes() {
    return this.activityLogsService.getActionTypes();
  }

  @Get('entity-types')
  @HasPermission('activity-logs:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get list of unique entity types' })
  @ApiOkResponse({ description: 'List of entity types.' })
  getEntityTypes() {
    return this.activityLogsService.getEntityTypes();
  }

  @Delete('cleanup')
  @HasPermission('activity-logs:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clean up older activity logs' })
  @ApiOkResponse({ description: 'Clean up completed.' })
  cleanup(@Query('olderThanDays') olderThanDays: string) {
    const days = parseInt(olderThanDays, 10) || 30;
    return this.activityLogsService.cleanup(days);
  }

  @Get()
  @HasPermission('activity-logs:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of activity logs' })
  @ApiOkResponse({ description: 'A list of activity logs.' })
  findAll(@Query() filterDto: ActivityLogFilterDto) {
    return this.activityLogsService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('activity-logs:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single activity log by ID' })
  @ApiOkResponse({ description: 'The requested activity log.' })
  findOne(@Param('id') id: string) {
    return this.activityLogsService.findById(+id);
  }

  @Delete(':id')
  @HasPermission('activity-logs:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an activity log entry' })
  @ApiOkResponse({ description: 'The activity log has been successfully deleted.' })
  async remove(@Param('id') id: string) {
    await this.activityLogsService.delete(+id);
    return { message: 'Activity log deleted successfully' };
  }
}
