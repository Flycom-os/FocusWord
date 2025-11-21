import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";



export class HistoryDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'image balloon'
  })
  @IsNotEmpty()
  image: string;
  @ApiProperty({example:'1999', description:'year history'})
  @IsNotEmpty()
  year: string
  @ApiProperty({example:'text text text...', description:'description'})
  @IsNotEmpty()
  description: string
}