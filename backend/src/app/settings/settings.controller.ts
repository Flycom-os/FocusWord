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
  @ApiOperation({ summary: 'Create new setting' })
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  findAll(@Query() searchDto: SearchSettingsDto) {
    return this.settingsService.findAll(searchDto);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get settings by category' })
  findByCategory(@Param('category') category: string) {
    return this.settingsService.findByCategory(category);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get setting by key' })
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Put('batch')
  @ApiOperation({ summary: 'Batch update settings' })
  updateMultiple(
    @Body() updateSettingsDto: { settings: { key: string; value: string }[] },
    @Query('force') force?: string,
  ) {
    const forceFlag = force === 'true' || force === '1';
    return this.settingsService.updateMultiple(updateSettingsDto.settings, forceFlag);
  }

  @Put(':key')
  @ApiOperation({ summary: 'Update setting' })
  update(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @Query('force') force?: string,
  ) {
    const forceFlag = force === 'true' || force === '1';
    // call internal _update when force is required
    if (forceFlag) {
      // bypassing public signature to allow force
      // @ts-ignore access private method
      return (this.settingsService as any)._update(key, updateSettingDto, true);
    }

    return this.settingsService.update(key, updateSettingDto);
  }
}
