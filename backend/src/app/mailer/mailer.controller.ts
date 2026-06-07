import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { JwtAuthGuard } from '../../jwt-auth.guard';
import { SendEmailDto } from '../../dto/mailer/send-email.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Mailer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('mailer')
export class MailerController {
  constructor(private readonly mailerService: MailerService) {}

  @Post('test')
  @ApiOperation({ summary: 'Send test email' })
  async test(@Body() dto: SendEmailDto) {
    // If dto.mailerConfig is provided, parse JSON and pass as transient transport config
    let transportConfig: any = undefined;
    if (dto.mailerConfig) {
      try {
        transportConfig = JSON.parse(dto.mailerConfig);
      } catch (err) {
        // If parsing fails, return error response
        return { success: false, error: 'Invalid mailerConfig JSON' };
      }
    }

    const info = await this.mailerService.sendMail({
      to: dto.to,
      subject: dto.subject || 'Test email from FocusWord',
      text: dto.text,
      html: dto.html,
      transportConfig,
    });

    return { success: true, info };
  }
}
