import { Injectable, Logger } from '@nestjs/common';
import { IDnsProviderStrategy } from '../interfaces/dns-provider.interface';
import { DnsProviderType } from '../domain.enums';

@Injectable()
export class CloudflareDnsStrategy implements IDnsProviderStrategy {
  readonly type = DnsProviderType.CLOUDFLARE;
  private readonly logger = new Logger(CloudflareDnsStrategy.name);

  // Placeholder methods for Cloudflare API interaction
  async getTxtRecord(
    settings: Record<string, any>,
    name: string,
  ): Promise<string[]> {
    this.logger.warn(
      `Cloudflare getTxtRecord not implemented. Settings: ${JSON.stringify(settings)}, Name: ${name}`,
    );
    return [];
  }

  async addTxtRecord(
    settings: Record<string, any>,
    name: string,
    value: string,
  ): Promise<void> {
    this.logger.warn(
      `Cloudflare addTxtRecord not implemented. Settings: ${JSON.stringify(settings)}, Name: ${name}, Value: ${value}`,
    );
  }

  async deleteTxtRecord(
    settings: Record<string, any>,
    name: string,
    value: string,
  ): Promise<void> {
    this.logger.warn(
      `Cloudflare deleteTxtRecord not implemented. Settings: ${JSON.stringify(settings)}, Name: ${name}, Value: ${value}`,
    );
  }

  async checkMxRecords(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Cloudflare checkMxRecords not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }
  async checkSpfRecord(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Cloudflare checkSpfRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }
  async checkDkimRecord(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Cloudflare checkDkimRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }
  async checkDmarcRecord(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Cloudflare checkDmarcRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }

  async updateMxRecords(
    settings: Record<string, any>,
    domainName: string,
    records: { exchange: string; priority: number }[],
  ): Promise<void> {
    this.logger.warn(
      `Cloudflare updateMxRecords not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Records: ${JSON.stringify(records)}`,
    );
  }
  async updateSpfRecord(
    settings: Record<string, any>,
    domainName: string,
    record: string,
  ): Promise<void> {
    this.logger.warn(
      `Cloudflare updateSpfRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Record: ${record}`,
    );
  }
  async updateDkimRecord(
    settings: Record<string, any>,
    domainName: string,
    selector: string,
    publicKey: string,
  ): Promise<void> {
    this.logger.warn(
      `Cloudflare updateDkimRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Selector: ${selector}, PublicKey: ${publicKey}`,
    );
  }
  async updateDmarcRecord(
    settings: Record<string, any>,
    domainName: string,
    record: string,
  ): Promise<void> {
    this.logger.warn(
      `Cloudflare updateDmarcRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Record: ${record}`,
    );
  }
}
