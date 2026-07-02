import { Module } from '@nestjs/common';
import { TempSettingsController } from './temp-settings.controller';
import { AuthModule } from '../../user/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [TempSettingsController],
})
export class SimpleSettingsModule {}
