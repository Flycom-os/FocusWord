import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { DomainController } from './domain.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { DnsProviderService } from './services/dns-provider.service';
import { CloudflareDnsStrategy } from './strategies/cloudflare-dns.strategy';
import { Route53DnsStrategy } from './strategies/route53-dns.strategy';

@Module({
  imports: [PrismaModule],
  providers: [
    DomainService,
    DnsProviderService,
    CloudflareDnsStrategy,
    Route53DnsStrategy,
  ],
  controllers: [DomainController],
  exports: [DomainService],
})
export class DomainManagementModule {}
