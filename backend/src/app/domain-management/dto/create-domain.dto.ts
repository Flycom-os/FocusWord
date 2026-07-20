import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';
import { DnsProviderType } from '../domain.enums'; // Adjust path if necessary

export class CreateDomainDto {
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @IsEnum(DnsProviderType)
  @IsOptional()
  dnsProviderType?: DnsProviderType;

  @IsObject()
  @IsOptional()
  dnsProviderCredentials?: Record<string, any>; // Store encrypted credentials for DNS provider API
}
