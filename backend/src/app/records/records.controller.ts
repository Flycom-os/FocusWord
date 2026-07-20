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
  Req,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateRecordDto } from '../dto/records/create-record.dto';
import { CreateRecordDraftDto } from '../dto/records/create-record-draft.dto';
import { RecordAiCompleteDto } from '../dto/records/record-ai-complete.dto';
import { RecordFilterDto } from '../dto/records/record-filter.dto';
import { UpdateRecordDto } from '../dto/records/update-record.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { HasPermission } from '../../common/decorators/has-permission.decorator';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@ApiBearerAuth()
@ApiTags('records')
@Controller('api/records')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  @HasPermission('records:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new record' })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  async create(
    @Body() createRecordDto: CreateRecordDto,
    @Req() req: RequestWithUser,
  ) {
    createRecordDto.authorId = req.user.userId;
    return this.recordsService.create(createRecordDto);
  }

  @Post('draft')
  @HasPermission('records:2')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a record draft with defaults' })
  @ApiCreatedResponse({
    description: 'The record draft has been successfully created.',
  })
  async createDraft(
    @Body() createRecordDraftDto: CreateRecordDraftDto,
    @Req() req: RequestWithUser,
  ) {
    createRecordDraftDto.authorId = req.user.userId;
    return this.recordsService.createDraft(createRecordDraftDto);
  }

  @Post('ai/complete')
  @HasPermission('records:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate record content via AI helper' })
  @ApiOkResponse({ description: 'AI-generated content result.' })
  completeWithAi(@Body() dto: RecordAiCompleteDto) {
    return this.recordsService.completeWithAi(dto.prompt, dto.content);
  }

  @Get()
  @HasPermission('records:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Retrieve a list of records with optional filtering',
  })
  @ApiOkResponse({ description: 'A list of records.' })
  findAll(@Query() filterDto: RecordFilterDto) {
    return this.recordsService.findAll(filterDto);
  }

  @Get(':id')
  @HasPermission('records:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single record by ID' })
  @ApiOkResponse({ description: 'The requested record.' })
  async findOne(@Param('id') id: string) {
    const record = await this.recordsService.findById(+id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    return record;
  }

  @Get('slug/:slug')
  @HasPermission('records:0')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a single record by slug' })
  @ApiOkResponse({ description: 'The requested record.' })
  async findOneBySlug(@Param('slug') slug: string) {
    const record = await this.recordsService.findOneBySlug(slug);
    if (!record) {
      throw new NotFoundException('Record not found');
    }
    return record;
  }

  @Put(':id')
  @HasPermission('records:1')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an existing record' })
  @ApiOkResponse({ description: 'The record has been successfully updated.' })
  update(@Param('id') id: string, @Body() updateRecordDto: UpdateRecordDto) {
    return this.recordsService.update(+id, updateRecordDto);
  }

  @Delete(':id')
  @HasPermission('records:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a record' })
  @ApiOkResponse({ description: 'The record has been successfully deleted.' })
  async remove(@Param('id') id: string) {
    await this.recordsService.delete(+id);
    return { message: 'Record deleted successfully' };
  }

  @Patch(':id/status')
  @HasPermission('records:2')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change record status' })
  @ApiOkResponse({
    description: 'The status of the record has been successfully changed.',
  })
  changeStatus(
    @Param('id') id: string,
    @Body('status') status: 'draft' | 'published',
  ) {
    return this.recordsService.changeStatus(+id, status);
  }
}
