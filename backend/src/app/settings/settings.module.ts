import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { TempSettingsController } from './temp-settings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SettingsController, TempSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
