import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoDto } from '../../dto/create-seo.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateSeoPresetDto extends SeoDto {
  @ApiProperty({ example: 'Новый пресет' })
  @IsString()
  name: string;

  @IsString()
  @ApiPropertyOptional({ example: 'Новый пресет' })
  seo_title: string;

  @ApiPropertyOptional({ example: 'Новый пресет' })
  @IsString()
  seo_description: string;

  @IsBoolean()
  @IsOptional()
  system_preset?: boolean;
}
