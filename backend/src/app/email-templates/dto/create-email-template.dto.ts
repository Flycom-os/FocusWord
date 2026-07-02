import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateEmailTemplateDto {
  @IsString()
  name: string;

  @IsString()
  subject: string;

  @IsString()
  bodyHtml: string;

  @IsString()
  @IsOptional()
  bodyText?: string;

  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;

  @IsString()
  @IsOptional()
  description?: string;
}
