import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDefined,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MxRecordDto {
  @IsString()
  exchange: string;

  @IsNumber()
  priority: number;
}

export class DkimRecordDto {
  @IsString()
  selector: string; // e.g., 's1'

  @IsString()
  publicKey: string; // The value of the DKIM TXT record
}

export class UpdateDnsRecordsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MxRecordDto)
  @IsOptional()
  mxRecords?: MxRecordDto[];

  @IsString()
  @IsOptional()
  spfRecord?: string; // The value of the SPF TXT record

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DkimRecordDto)
  @IsOptional()
  dkimRecords?: DkimRecordDto[];

  @IsString()
  @IsOptional()
  dmarcRecord?: string; // The value of the DMARC TXT record
}
