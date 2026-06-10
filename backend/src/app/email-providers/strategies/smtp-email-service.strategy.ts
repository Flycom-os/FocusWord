import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailServiceStrategy } from '../interfaces/email-service-strategy.interface';
import { EmailProviderType } from '../email-provider.enums';

@Injectable()
export class SmtpEmailServiceStrategy implements IEmailServiceStrategy {
  readonly type = EmailProviderType.SMTP;
  private readonly logger = new Logger(SmtpEmailServiceStrategy.name);

  async send(
    settings: Record<string, any>,
    from: string,
    to: string | string[],
    subject: string,
    htmlBody?: string,
    textBody?: string,
    attachments?: any[],
  ): Promise<any> {
    const { host, port, secure, auth_user, auth_pass } = settings;

    if (!host || !port || !auth_user || !auth_pass) {
      throw new Error('Missing SMTP settings: host, port, auth_user, or auth_pass.');
    }

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure || false, // Use TLS
      auth: {
        user: auth_user,
        pass: auth_pass,
      },
    });

    try {
      const info = await transporter.sendMail({
        from: from,
        to: Array.isArray(to) ? to.join(',') : to,
        subject: subject,
        html: htmlBody,
        text: textBody,
        attachments: attachments,
      });
      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email via SMTP: ${error.message}`, error.stack);
      throw error;
    }
  }
}
