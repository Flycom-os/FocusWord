import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { EmailProviderService } from './email-provider.service';
import { CreateEmailProviderDto } from './dto/create-email-provider.dto';
import { UpdateEmailProviderDto } from './dto/update-email-provider.dto';
import { EmailProviderType } from '@prisma/client';

@Controller('email-providers')
export class EmailProviderController {
  constructor(private readonly emailProviderService: EmailProviderService) {}

  @Post()
  create(@Body() createEmailProviderDto: CreateEmailProviderDto) {
    return this.emailProviderService.create(createEmailProviderDto);
  }

  @Get()
  findAll() {
    return this.emailProviderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.emailProviderService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmailProviderDto: UpdateEmailProviderDto,
  ) {
    return this.emailProviderService.update(id, updateEmailProviderDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.emailProviderService.remove(id);
  }

  @Post('send-test')
  async sendTestEmail(
    @Body('providerConfigId', ParseIntPipe) providerConfigId: number,
    @Body('from') from: string,
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('htmlBody') htmlBody: string,
    @Body('textBody') textBody: string,
  ) {
    // Basic implementation for testing. In a real scenario, you'd use a template.
    return this.emailProviderService.sendEmail(
      providerConfigId,
      from,
      to,
      subject,
      htmlBody,
      textBody,
    );
  }
}
