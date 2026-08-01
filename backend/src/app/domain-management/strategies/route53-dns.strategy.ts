import { Injectable, Logger } from '@nestjs/common';
import { IDnsProviderStrategy } from '../interfaces/dns-provider.interface';
import { DnsProviderType } from '../domain.enums';

@Injectable()
export class Route53DnsStrategy implements IDnsProviderStrategy {
  readonly type = DnsProviderType.ROUTE53;
  private readonly logger = new Logger(Route53DnsStrategy.name);

  // Placeholder methods for AWS Route 53 API interaction
  async getTxtRecord(
    settings: Record<string, any>,
    name: string,
  ): Promise<string[]> {
    this.logger.warn(
      `Route53 getTxtRecord not implemented. Settings: ${JSON.stringify(settings)}, Name: ${name}`,
    );
    return [];
  }

  async addTxtRecord(
    settings: Record<string, any>,
    name: string,
    value: string,
  ): Promise<void> {
    this.logger.warn(
      `Route53 addTxtRecord not implemented. Settings: ${JSON.stringify(settings)}, Name: ${name}, Value: ${value}`,
    );
  }

  async deleteTxtRecord(
    settings: Record<string, any>,
    name: string,
    value: string,
  ): Promise<void> {
    this.logger.warn(
      `Route53 deleteTxtRecord not implemented. Settings: ${JSON.stringify(settings)}, Name: ${name}, Value: ${value}`,
    );
  }

  async checkMxRecords(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Route53 checkMxRecords not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }
  async checkSpfRecord(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Route53 checkSpfRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }
  async checkDkimRecord(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Route53 checkDkimRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }
  async checkDmarcRecord(
    settings: Record<string, any>,
    domainName: string,
  ): Promise<boolean> {
    this.logger.warn(
      `Route53 checkDmarcRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}`,
    );
    return false;
  }

  async updateMxRecords(
    settings: Record<string, any>,
    domainName: string,
    records: { exchange: string; priority: number }[],
  ): Promise<void> {
    this.logger.warn(
      `Route53 updateMxRecords not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Records: ${JSON.stringify(records)}`,
    );
  }
  async updateSpfRecord(
    settings: Record<string, any>,
    domainName: string,
    record: string,
  ): Promise<void> {
    this.logger.warn(
      `Route53 updateSpfRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Record: ${record}`,
    );
  }
  async updateDkimRecord(
    settings: Record<string, any>,
    domainName: string,
    selector: string,
    publicKey: string,
  ): Promise<void> {
    this.logger.warn(
      `Route53 updateDkimRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Selector: ${selector}, PublicKey: ${publicKey}`,
    );
  }
  async updateDmarcRecord(
    settings: Record<string, any>,
    domainName: string,
    record: string,
  ): Promise<void> {
    this.logger.warn(
      `Route53 updateDmarcRecord not implemented. Settings: ${JSON.stringify(settings)}, Domain: ${domainName}, Record: ${record}`,
    );
  }
}
