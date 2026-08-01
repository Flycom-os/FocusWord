import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmailProviderDto } from './dto/create-email-provider.dto';
import { UpdateEmailProviderDto } from './dto/update-email-provider.dto';
import { EmailProvider, EmailProviderType, Prisma } from '@prisma/client';
import { IEmailServiceStrategy } from './interfaces/email-service-strategy.interface';
import { SmtpEmailServiceStrategy } from './strategies/smtp-email-service.strategy';
import { CryptoService } from '../../common/services/crypto.service';

@Injectable()
export class EmailProviderService {
  private readonly logger = new Logger(EmailProviderService.name);
  private strategies: Map<EmailProviderType, IEmailServiceStrategy> = new Map();

  constructor(
    private prisma: PrismaService,
    private cryptoService: CryptoService,
    private smtpStrategy: SmtpEmailServiceStrategy, // Inject other strategies here
  ) {
    this.strategies.set(EmailProviderType.SMTP, this.smtpStrategy);
    // this.strategies.set(EmailProviderType.SENDGRID, this.sendGridStrategy);
    // ... set other strategies
  }

  private encryptSettings(settings: Record<string, any>): Prisma.JsonObject {
    const encrypted = this.cryptoService.encrypt(JSON.stringify(settings));
    return encrypted as unknown as Prisma.JsonObject;
  }

  private decryptSettings(settings: Prisma.JsonValue): Record<string, any> {
    if (
      !settings ||
      typeof settings !== 'object' ||
      !('iv' in settings) ||
      !('encryptedData' in settings)
    ) {
      return {};
    }
    const decryptedString = this.cryptoService.decrypt(
      settings as { iv: string; encryptedData: string },
    );
    return JSON.parse(decryptedString);
  }

  async create(
    createEmailProviderDto: CreateEmailProviderDto,
  ): Promise<EmailProvider> {
    const { settings, ...rest } = createEmailProviderDto;
    const data: Prisma.EmailProviderCreateInput = { ...rest };
    if (settings) {
      data.settings = this.encryptSettings(settings);
    }
    return this.prisma.emailProvider.create({ data });
  }

  async findAll(): Promise<EmailProvider[]> {
    const providers = await this.prisma.emailProvider.findMany();
    // Decrypt settings for all providers, but be cautious in production with sensitive data exposure
    return providers.map((provider) => ({
      ...provider,
      settings: this.decryptSettings(provider.settings),
    }));
  }

  async findOne(id: number): Promise<EmailProvider | null> {
    const provider = await this.prisma.emailProvider.findUnique({
      where: { id },
    });
    if (provider) {
      return { ...provider, settings: this.decryptSettings(provider.settings) };
    }
    return null;
  }

  async update(
    id: number,
    updateEmailProviderDto: UpdateEmailProviderDto,
  ): Promise<EmailProvider> {
    const { settings, ...rest } = updateEmailProviderDto;
    const data: Prisma.EmailProviderUpdateInput = { ...rest };
    if (settings) {
      data.settings = this.encryptSettings(settings);
    }
    const updatedProvider = await this.prisma.emailProvider.update({
      where: { id },
      data,
    });
    return {
      ...updatedProvider,
      settings: this.decryptSettings(updatedProvider.settings),
    };
  }

  async remove(id: number): Promise<EmailProvider> {
    return this.prisma.emailProvider.delete({ where: { id } });
  }

  async sendEmail(
    providerConfigId: number,
    from: string, // 'from' address
    to: string | string[],
    subject: string,
    htmlBody?: string,
    textBody?: string,
    attachments?: any[], // Adjust type as needed for Nodemailer
  ): Promise<any> {
    const providerConfig = await this.prisma.emailProvider.findUnique({
      where: { id: providerConfigId },
    });

    if (!providerConfig) {
      throw new Error('Email provider configuration not found.');
    }

    const decryptedSettings = this.decryptSettings(providerConfig.settings);

    const strategy = this.strategies.get(providerConfig.type);
    if (!strategy) {
      throw new Error(
        `No email sending strategy found for type: ${providerConfig.type}`,
      );
    }

    this.logger.log(
      `Sending email using ${providerConfig.type} provider (ID: ${providerConfigId})`,
    );
    return strategy.send(
      decryptedSettings,
      from,
      to,
      subject,
      htmlBody,
      textBody,
      attachments,
    );
  }
}
