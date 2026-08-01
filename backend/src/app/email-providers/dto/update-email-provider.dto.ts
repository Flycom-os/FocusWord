import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailProviderDto } from './create-email-provider.dto';
import { IsNumber } from 'class-validator';

export class UpdateEmailProviderDto extends PartialType(
  CreateEmailProviderDto,
) {
  @IsNumber()
  id: number; // Include ID for clarity, though it comes from the URL param
}
