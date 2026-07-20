import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { Domain, DomainStatus, DnsProviderType } from '@prisma/client';
import { DnsProviderService } from './services/dns-provider.service';
import { UpdateDnsRecordsDto } from './dto/update-dns-records.dto';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(
    private prisma: PrismaService,
    private dnsProviderService: DnsProviderService,
  ) {}

  async create(createDomainDto: CreateDomainDto): Promise<Domain> {
    // Generate a verification token
    const verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    return this.prisma.domain.create({
      data: {
        ...createDomainDto,
        verificationToken,
        status: DomainStatus.PENDING_VERIFICATION,
      },
    });
  }

  async findAll(): Promise<Domain[]> {
    return this.prisma.domain.findMany();
  }

  async findOne(id: number): Promise<Domain | null> {
    return this.prisma.domain.findUnique({ where: { id } });
  }

  async update(id: number, updateDomainDto: UpdateDomainDto): Promise<Domain> {
    return this.prisma.domain.update({
      where: { id },
      data: updateDomainDto,
    });
  }

  async remove(id: number): Promise<Domain> {
    return this.prisma.domain.delete({ where: { id } });
  }

  async verifyDomain(id: number): Promise<Domain> {
    const domain = await this.prisma.domain.findUnique({ where: { id } });
    if (!domain) {
      throw new Error('Domain not found.');
    }
    if (
      !domain.verificationToken ||
      !domain.dnsProviderType ||
      !domain.dnsProviderCredentials
    ) {
      this.logger.warn(
        `Domain ${domain.name} (ID: ${id}) missing verification token, DNS provider type, or credentials for automated verification.`,
      );
      // In a real scenario, you'd provide instructions for manual verification or throw an error.
      throw new Error(
        'Automated verification not possible without DNS provider configuration.',
      );
    }

    // Check TXT record for verification
    const records = await this.dnsProviderService.getTxtRecord(
      domain.dnsProviderType,
      domain.dnsProviderCredentials as any, // Cast Json to expected type
      `_gemini-verify.${domain.name}`, // Standard prefix for verification
    );

    if (records.includes(domain.verificationToken)) {
      return this.prisma.domain.update({
        where: { id },
        data: { status: DomainStatus.VERIFIED, isVerified: true },
      });
    } else {
      throw new Error(
        'Domain verification failed: TXT record not found or mismatched.',
      );
    }
  }

  async checkDnsRecords(id: number): Promise<Domain> {
    const domain = await this.prisma.domain.findUnique({ where: { id } });
    if (!domain) {
      throw new Error('Domain not found.');
    }
    if (!domain.dnsProviderType || !domain.dnsProviderCredentials) {
      throw new Error('DNS provider not configured for this domain.');
    }

    // Here you would call dnsProviderService methods to check MX, SPF, DKIM, DMARC
    // This is a placeholder for actual DNS record checks
    this.logger.log(`Checking DNS records for domain: ${domain.name}`);
    const mxCheck = await this.dnsProviderService.checkMxRecords(
      domain.dnsProviderType,
      domain.dnsProviderCredentials as any,
      domain.name,
    );
    const spfCheck = await this.dnsProviderService.checkSpfRecord(
      domain.dnsProviderType,
      domain.dnsProviderCredentials as any,
      domain.name,
    );
    const dkimCheck = await this.dnsProviderService.checkDkimRecord(
      domain.dnsProviderType,
      domain.dnsProviderCredentials as any,
      domain.name,
    );
    const dmarcCheck = await this.dnsProviderService.checkDmarcRecord(
      domain.dnsProviderType,
      domain.dnsProviderCredentials as any,
      domain.name,
    );

    return this.prisma.domain.update({
      where: { id },
      data: {
        mxRecordsSet: mxCheck,
        spfRecordSet: spfCheck,
        dkimRecordSet: dkimCheck,
        dmarcRecordSet: dmarcCheck,
        // Update status based on checks
        status:
          mxCheck && spfCheck && dkimCheck && dmarcCheck
            ? DomainStatus.ACTIVE
            : DomainStatus.VERIFIED, // If all checks pass, it's active. Otherwise, still verified but records might be off.
      },
    });
  }

  async updateDnsRecords(
    id: number,
    updateDnsRecordsDto: UpdateDnsRecordsDto,
  ): Promise<Domain> {
    const domain = await this.prisma.domain.findUnique({ where: { id } });
    if (!domain) {
      throw new Error('Domain not found.');
    }
    if (!domain.dnsProviderType || !domain.dnsProviderCredentials) {
      throw new Error(
        'DNS provider not configured for this domain for automated updates.',
      );
    }

    const { mxRecords, spfRecord, dkimRecords, dmarcRecord } =
      updateDnsRecordsDto;

    if (mxRecords) {
      await this.dnsProviderService.updateMxRecords(
        domain.dnsProviderType,
        domain.dnsProviderCredentials as any,
        domain.name,
        mxRecords,
      );
    }
    if (spfRecord) {
      await this.dnsProviderService.updateSpfRecord(
        domain.dnsProviderType,
        domain.dnsProviderCredentials as any,
        domain.name,
        spfRecord,
      );
    }
    if (dkimRecords) {
      // Logic to update DKIM records - this is often more complex as it involves selectors
      // For simplicity, this is a placeholder
      for (const dkim of dkimRecords) {
        await this.dnsProviderService.updateDkimRecord(
          domain.dnsProviderType,
          domain.dnsProviderCredentials as any,
          domain.name,
          dkim.selector,
          dkim.publicKey,
        );
      }
    }
    if (dmarcRecord) {
      await this.dnsProviderService.updateDmarcRecord(
        domain.dnsProviderType,
        domain.dnsProviderCredentials as any,
        domain.name,
        dmarcRecord,
      );
    }

    return this.checkDnsRecords(id); // Re-check and update domain status after changes
  }
}
