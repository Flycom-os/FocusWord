import { Controller, Get, Post, Put, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settings')
export class TempSettingsController {
  
  @Get()
  @ApiOperation({ summary: 'Получить все настройки (временная реализация)' })
  findAll() {
    // Временная реализация с базовыми настройками
    return [
      { id: 1, key: 'theme_mode', value: 'light', type: 'string', category: 'appearance', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, key: 'theme', value: 'default', type: 'string', category: 'appearance', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, key: 'site_name', value: 'FocusWord', type: 'string', category: 'general', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 4, key: 'site_description', value: '', type: 'string', category: 'general', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 5, key: 'site_url', value: 'https://focusword.com', type: 'string', category: 'general', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 6, key: 'maintenance_mode', value: 'false', type: 'boolean', category: 'general', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 7, key: 'auto_backup', value: 'true', type: 'boolean', category: 'database', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 8, key: 'backup_frequency', value: 'daily', type: 'string', category: 'database', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 9, key: 'max_backups', value: '7', type: 'number', category: 'database', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ];
  }

  @Put('batch')
  @ApiOperation({ summary: 'Массовое обновление настроек (временная реализация)' })
  updateMultiple(@Body() updateSettingsDto: { settings: { key: string; value: string }[] }) {
    // Временная реализация - просто возвращаем успех
    console.log('Received settings update:', updateSettingsDto.settings);
    return { message: 'Настройки успешно обновлены', updated: updateSettingsDto.settings.length };
  }
}
