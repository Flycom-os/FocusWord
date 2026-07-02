import { Injectable, Logger } from '@nestjs/common';
import { SettingsService } from '../settings/settings.service';

interface SendOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: any = null;

  constructor(private readonly settingsService: SettingsService) {}

  private async getTransporter(overrideConfig?: any) {
    // If overrideConfig is provided, always create a fresh transporter for testing
    if (!overrideConfig && this.transporter) return this.transporter;

    // Try to load nodemailer lazily; if it's not installed, provide a clear error
    let nodemailer: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      nodemailer = require('nodemailer');
    } catch (err) {
      this.logger.error('nodemailer is not installed. Run `npm install nodemailer` to enable email sending.');
      throw err;
    }

    // Try to read mailer config from settings (key: mailer_config) as JSON unless override provided
    let config: any = null;
    if (!overrideConfig) {
      try {
        const setting = await this.settingsService.findOne('mailer_config');
        if (setting && setting.value) {
          try {
            config = JSON.parse(setting.value);
          } catch (e) {
            config = null;
          }
        }
      } catch (e) {
        // ignore - settings may not exist yet
      }
    } else {
      config = overrideConfig;
    }

    // Fallback to environment variables
    const host = process.env.SMTP_HOST || (config && config.host);
    const port = (process.env.SMTP_PORT && Number(process.env.SMTP_PORT)) || (config && config.port) || 587;
    const user = process.env.SMTP_USER || (config && config.user);
    const pass = process.env.SMTP_PASS || (config && config.pass);
    const secure = (process.env.SMTP_SECURE === 'true') || (config && config.secure) || false;

    if (!host) {
      this.logger.warn('No SMTP host configured; mail sending will fail until configured.');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    if (!overrideConfig) {
      this.transporter = transporter;
    }

    return transporter;
  }

  async sendMail(options: SendOptions & { transportConfig?: any }) {
    const transporter = await this.getTransporter(options.transportConfig);
    const from = options.from || process.env.SMTP_FROM || 'no-reply@focusword.com';

    const mailOptions = {
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    this.logger.log(`Sending mail to ${options.to}`);
    const info = await transporter.sendMail(mailOptions);
    this.logger.log(`Mail sent: ${info && info.messageId}`);
    return info;
  }
}
