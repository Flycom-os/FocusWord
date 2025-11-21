import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";



export class NewsDto{
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
  @ApiProperty({example:'name_news', description:'name history'})
  @IsNotEmpty()
  name: string
  @ApiProperty({example:1, description:'number'})
  @IsNotEmpty()
  number: number
  @ApiProperty({example:'text text text...', description:'description'})
  @IsNotEmpty()
  description: string
}