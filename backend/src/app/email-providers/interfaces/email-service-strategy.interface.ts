import { EmailProviderType } from '@prisma/client'; // Assuming types from Prisma Client

export interface IEmailServiceStrategy {
  type: EmailProviderType;
  send(
    settings: Record<string, any>,
    from: string,
    to: string | string[],
    subject: string,
    htmlBody?: string,
    textBody?: string,
    attachments?: any[],
  ): Promise<any>;
}
