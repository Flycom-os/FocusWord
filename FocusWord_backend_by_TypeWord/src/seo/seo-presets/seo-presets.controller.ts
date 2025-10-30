import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SeoPresetsService } from './seo-presets.service';
import { SEOPreset } from './seo-presets.model';
import { CreateSeoPresetDto } from './dto/create-seo-preset.dto';
import { UpdateSeoPresetDto } from './dto/update-seo-preset.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { RolesGuard } from '../../roles/roles.guard';
import { RoleProperties } from '../../roles/roles.decorator';
import { SeoPresetDeleteOkResponse } from './responses/seo-presets.ok.responses';
import { UnauthorizedExceptionResponse } from '../../auth/responses/auth.unauthorized.responses';
import { ForbiddenAccessExceptionResponse } from '../../roles/responses/roles.forbidden.responses';
import { SeoPresetsDeleteForbidden } from './responses/seo-presets.forbidden.responses';
import { SeoPresetConflictResponse } from './responses/seo-presets.conflict.responses';
import { GetForPageIntf } from 'src/files/interfaces/service.interfaces';
import { UnprocessableEntityResponse } from '../../responses/validation.response';

@ApiTags('SEO пресеты')
@Controller('presets')
export class SeoPresetsController {
  constructor(
    @Inject(SeoPresetsService)
    private seoPresetsService: SeoPresetsService,
  ) {}
//GET
  /**get all seo presets */
  @ApiOperation({ summary: 'Получение всех сео пресетов' })
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: [SEOPreset] })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @Get('/seo-presets')
  async getSeoPresets(): Promise<SEOPreset[]> {
    return await this.seoPresetsService.getSeoPresets();
  }

  /**get seo-presets for paggination */
  @ApiOperation({ summary: 'Получение всех сео пресетов' })
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение сео пресетов для пагинации и поиска' })
  @Get('/seo-presets/:current_page/:per_page')
  getForPage(
    @Param('current_page', new ParseIntPipe()) current_page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
  ): Promise<GetForPageIntf<SEOPreset>> {
    return this.seoPresetsService.gerSeoPresetsForPage(current_page, per_page);
  }

//POST
  /**create new seo-preset */
  @ApiOperation({ summary: 'Создание сео пресета' })
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, seo_presets_manage: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SEOPreset })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @ApiConflictResponse({ description: 'Error: Conflict', type: SeoPresetConflictResponse })
  @Post('/create-seo-preset')
  async createSeoPreset(@Body() createSeoPresetDto: CreateSeoPresetDto): Promise<SEOPreset> {
    return await this.seoPresetsService.createSeoPreset(createSeoPresetDto);
  }
//PATCH
  /**update seo- name?, title, description */
  @ApiOperation({ summary: 'Обновление сео имени, заголовока, описания' })
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, seo_presets_manage: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SEOPreset })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @ApiConflictResponse({ description: 'Error: Conflict', type: SeoPresetConflictResponse })
  @Patch('/update-seo-preset/:id')
  async updateSeoPreset(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSeoPresetDto): Promise<SEOPreset> {
    return await this.seoPresetsService.updateSeoPreset(id, dto);
  }
//DELETE
  /**delete one seo-preset */
  @ApiOperation({ summary: 'Удаление сео пресета' })
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, seo_presets_manage: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({ type: SeoPresetDeleteOkResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: SeoPresetsDeleteForbidden })
  @Delete('/delete-seo-preset/:id')
  async deleteSeoPreset(@Param('id', ParseIntPipe) id: number): Promise<SeoPresetDeleteOkResponse> {
    return await this.seoPresetsService.deleteSeoPreset(id);
  }
}
