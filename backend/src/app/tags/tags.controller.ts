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
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { CreateTagDto } from '../dto/tags/create-tag.dto';
import { UpdateTagDto } from '../dto/tags/update-tag.dto';
import { TagFilterDto } from '../dto/tags/tag-filter.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('tags')
@Controller('tags')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  @HasPermission('tags:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tag' })
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  @Get()
  @HasPermission('tags:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a list of tags' })
  findAll(@Query() filterDto: TagFilterDto) {
    return this.tagsService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('tags:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single tag by ID' })
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(+id);
  }

  @Put(':id')
  @HasPermission('tags:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing tag' })
  update(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.tagsService.update(+id, dto);
  }

  @Delete(':id')
  @HasPermission('tags:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tag' })
  async remove(@Param('id') id: string) {
    await this.tagsService.delete(+id);
    return { message: 'Tag deleted successfully' };
  }
}
