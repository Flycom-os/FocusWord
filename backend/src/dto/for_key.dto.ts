import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";



export class PromocodesDto{
  @ApiProperty({
    type: 'string',
    description: 'promocode'
  })
  @IsNotEmpty()
  promocode: string;
  @ApiProperty({example:'2025-15-12', description:'date expired'})
  @IsNotEmpty()
  date_expired: string
}