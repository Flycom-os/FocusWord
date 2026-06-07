import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { MailerController } from './mailer.controller';
import { SettingsModule } from '../settings/settings.module';
import { AuthModule } from '../../user/auth/auth.module';

@Module({
  imports: [SettingsModule, AuthModule],
  providers: [MailerService],
  controllers: [MailerController],
  exports: [MailerService],
})
export class MailerModule {}
