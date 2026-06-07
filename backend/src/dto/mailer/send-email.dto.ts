import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsString()
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Plain text body', required: false })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiProperty({ description: 'HTML body', required: false })
  @IsOptional()
  @IsString()
  html?: string;

  @ApiProperty({ description: 'Optional mailer config (JSON string) to use for this test. Overrides saved settings.', required: false })
  @IsOptional()
  @IsString()
  mailerConfig?: string;
}
