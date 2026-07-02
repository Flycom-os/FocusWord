import { Injectable, Logger } from '@nestjs/common';
import { IDnsProviderStrategy } from '../interfaces/dns-provider.interface';
import { DnsProviderType } from '../domain.enums';
import { CloudflareDnsStrategy } from '../strategies/cloudflare-dns.strategy';
import { Route53DnsStrategy } from '../strategies/route53-dns.strategy';

@Injectable()
export class DnsProviderService {
  private readonly logger = new Logger(DnsProviderService.name);
  private strategies: Map<DnsProviderType, IDnsProviderStrategy> = new Map();

  constructor(
    private cloudflareStrategy: CloudflareDnsStrategy,
    private route53Strategy: Route53DnsStrategy,
    // Inject other DNS provider strategies here
  ) {
    this.strategies.set(DnsProviderType.CLOUDFLARE, this.cloudflareStrategy);
    this.strategies.set(DnsProviderType.ROUTE53, this.route53Strategy);
    // ... set other strategies
  }

  private getStrategy(type: DnsProviderType): IDnsProviderStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`No DNS provider strategy found for type: ${type}`);
    }
    return strategy;
  }

  // Generic methods to dispatch to specific strategies
  async getTxtRecord(type: DnsProviderType, settings: Record<string, any>, name: string): Promise<string[]> {
    return this.getStrategy(type).getTxtRecord(settings, name);
  }

  async addTxtRecord(type: DnsProviderType, settings: Record<string, any>, name: string, value: string): Promise<void> {
    return this.getStrategy(type).addTxtRecord(settings, name, value);
  }

  async deleteTxtRecord(type: DnsProviderType, settings: Record<string, any>, name: string, value: string): Promise<void> {
    return this.getStrategy(type).deleteTxtRecord(settings, name, value);
  }

  async checkMxRecords(type: DnsProviderType, settings: Record<string, any>, domainName: string): Promise<boolean> {
    return this.getStrategy(type).checkMxRecords(settings, domainName);
  }

  async checkSpfRecord(type: DnsProviderType, settings: Record<string, any>, domainName: string): Promise<boolean> {
    return this.getStrategy(type).checkSpfRecord(settings, domainName);
  }

  async checkDkimRecord(type: DnsProviderType, settings: Record<string, any>, domainName: string): Promise<boolean> {
    return this.getStrategy(type).checkDkimRecord(settings, domainName);
  }

  async checkDmarcRecord(type: DnsProviderType, settings: Record<string, any>, domainName: string): Promise<boolean> {
    return this.getStrategy(type).checkDmarcRecord(settings, domainName);
  }

  async updateMxRecords(type: DnsProviderType, settings: Record<string, any>, domainName: string, records: { exchange: string; priority: number }[]): Promise<void> {
    return this.getStrategy(type).updateMxRecords(settings, domainName, records);
  }

  async updateSpfRecord(type: DnsProviderType, settings: Record<string, any>, domainName: string, record: string): Promise<void> {
    return this.getStrategy(type).updateSpfRecord(settings, domainName, record);
  }

  async updateDkimRecord(type: DnsProviderType, settings: Record<string, any>, domainName: string, selector: string, publicKey: string): Promise<void> {
    return this.getStrategy(type).updateDkimRecord(settings, domainName, selector, publicKey);
  }

  async updateDmarcRecord(type: DnsProviderType, settings: Record<string, any>, domainName: string, record: string): Promise<void> {
    return this.getStrategy(type).updateDmarcRecord(settings, domainName, record);
  }
}
