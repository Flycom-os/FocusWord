import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';
import { EmailTemplate } from '@prisma/client';

@Injectable()
export class EmailTemplateService {
  constructor(private prisma: PrismaService) {}

  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return this.prisma.emailTemplate.create({ data: createEmailTemplateDto });
  }

  async findAll(): Promise<EmailTemplate[]> {
    return this.prisma.emailTemplate.findMany();
  }

  async findOne(id: number): Promise<EmailTemplate | null> {
    return this.prisma.emailTemplate.findUnique({ where: { id } });
  }

  async update(
    id: number,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplate> {
    return this.prisma.emailTemplate.update({
      where: { id },
      data: updateEmailTemplateDto,
    });
  }

  async remove(id: number): Promise<EmailTemplate> {
    return this.prisma.emailTemplate.delete({ where: { id } });
  }

  async renderTemplate(
    name: string,
    variables: Record<string, any>,
  ): Promise<{ subject: string; html: string; text: string | null }> {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { name },
    });
    if (!template) {
      throw new Error(`Email template "${name}" not found.`);
    }

    // Basic variable replacement (can be enhanced with a proper templating engine like Handlebars)
    let subject = template.subject;
    let html = template.bodyHtml;
    let text = template.bodyText;

    for (const key in variables) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(placeholder, variables[key]);
      html = html.replace(placeholder, variables[key]);
      if (text) {
        text = text.replace(placeholder, variables[key]);
      }
    }

    return { subject, html, text };
  }
}
