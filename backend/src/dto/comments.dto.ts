import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";



export class CommentsDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'image balloon'
  })
  @IsNotEmpty()
  image: string;
  @ApiProperty({example:'name', description:'name user'})
  @IsNotEmpty()
  name: string
  @ApiProperty({example:'page', description:'module page'})
  @IsNotEmpty()
  description: string
  @ApiProperty({example:'text', description:'reviuve'})
  @IsNotEmpty()
  about: string
}