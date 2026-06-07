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
  Put,
} from '@nestjs/common';
import { WidgetsService } from './widgets.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateWidgetDto } from '../dto/widgets/create-widget.dto';
import { UpdateWidgetDto } from '../dto/widgets/update-widget.dto';
import { WidgetFilterDto } from '../dto/widgets/widget-filter.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';

@ApiBearerAuth()
@ApiTags('widgets')
@Controller('widgets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class WidgetsController {
  constructor(private readonly widgetsService: WidgetsService) {}

  @Post()
  @HasPermission('widgets:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new widget' })
  @ApiCreatedResponse({ description: 'The widget has been successfully created.' })
  create(@Body() createWidgetDto: CreateWidgetDto) {
    return this.widgetsService.create(createWidgetDto);
  }

  @Get()
  @HasPermission('widgets:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of widgets' })
  @ApiOkResponse({ description: 'A list of widgets.' })
  findAll(@Query() filterDto: WidgetFilterDto) {
    return this.widgetsService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('widgets:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single widget by ID' })
  @ApiOkResponse({ description: 'The requested widget.' })
  findOne(@Param('id') id: string) {
    return this.widgetsService.findById(+id);
  }

  @Put(':id')
  @HasPermission('widgets:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing widget' })
  @ApiOkResponse({ description: 'The widget has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateWidgetDto: UpdateWidgetDto) {
    return this.widgetsService.update(+id, updateWidgetDto);
  }

  @Delete(':id')
  @HasPermission('widgets:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a widget' })
  @ApiOkResponse({ description: 'The widget has been successfully deleted.' })
  async remove(@Param('id') id: string) {
    await this.widgetsService.delete(+id);
    return { message: 'Widget deleted successfully' };
  }

  @Patch(':id/status')
  @HasPermission('widgets:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change widget status' })
  @ApiOkResponse({ description: 'The status of the widget has been successfully changed.' })
  changeStatus(@Param('id') id: string, @Body('status') status: 'active' | 'inactive') {
    return this.widgetsService.changeStatus(+id, status);
  }

  @Patch(':id/position')
  @HasPermission('widgets:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change widget position' })
  @ApiOkResponse({ description: 'The position of the widget has been successfully changed.' })
  changePosition(@Param('id') id: string, @Body('position') position: number) {
    return this.widgetsService.changePosition(+id, position);
  }
}
