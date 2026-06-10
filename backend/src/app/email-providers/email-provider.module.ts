import { Module } from '@nestjs/common';
import { EmailProviderService } from './email-provider.service';
import { EmailProviderController } from './email-provider.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SmtpEmailServiceStrategy } from './strategies/smtp-email-service.strategy';

@Module({
  imports: [PrismaModule],
  providers: [EmailProviderService, SmtpEmailServiceStrategy],
  controllers: [EmailProviderController],
  exports: [EmailProviderService],
})
export class EmailProviderModule {}
