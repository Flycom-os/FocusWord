import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateSettingDto } from "../../dto/settings/create-setting.dto";
import { UpdateSettingDto } from "../../dto/settings/update-setting.dto";
import { SearchSettingsDto } from "../../dto/settings/search-settings.dto";

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новую настройку' })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все настройки' })
  findAll(@Query() searchDto: SearchSettingsDto) {
    return this.settingsService.findAll(searchDto);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Получить настройки по категории' })
  findByCategory(@Param('category') category: string) {
    return this.settingsService.findByCategory(category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Получить настройку по ключу' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Обновить настройку' })
  update(@Param('key') key: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(key, updateSettingDto);
  }

  @Put('batch')
  @ApiOperation({ summary: 'Массовое обновление настроек' })
  updateMultiple(@Body() updateSettingsDto: { settings: { key: string; value: string }[] }) {
    return this.settingsService.updateMultiple(updateSettingsDto.settings);
  }
}
