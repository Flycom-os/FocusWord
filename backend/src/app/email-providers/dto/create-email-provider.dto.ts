import { IsString, IsBoolean, IsObject, IsOptional, IsEnum } from 'class-validator';
import { EmailProviderType } from '../email-provider.enums'; // Adjust path if necessary

export class CreateEmailProviderDto {
  @IsString()
  name: string;

  @IsEnum(EmailProviderType)
  type: EmailProviderType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>; // Flexible JSON for provider-specific settings

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
