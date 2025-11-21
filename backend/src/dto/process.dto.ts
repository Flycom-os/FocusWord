import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";



export class CreateProductDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'image balloon'
  })
  @IsNotEmpty()
  image: string;
  @ApiProperty({example:'name_news', description:'name history'})
  @IsNotEmpty()
  name: string

  @ApiProperty({example:'name_news', description:'name history'})
  @IsNotEmpty()
  volume: string

  @ApiProperty({example:2, description:'name history'})
  @IsNotEmpty()
  count: number;

  @ApiProperty({example:2, description:'name history'})
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({example:2, description:'name history'})
  @IsNotEmpty()
  total_count: number;
}