import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";



export class ShopsDto {

  @ApiProperty({example:'text text text...', description:'text offer'})
  @IsNotEmpty()
  locate: string
  @ApiProperty({example:'text text text...', description:'text offer'})
  @IsNotEmpty()
  name: string
  @ApiProperty({example:'text text text...', description:'text offer'})
  @IsNotEmpty()
  abount: string
  @ApiProperty({example:0, description:'text offer'})
  @IsNotEmpty()
  stats: number
}
export class ShopoCommentDto{
  @ApiProperty({example:'text text text...', description:'name'})
  @IsNotEmpty()
  name:string;
  @ApiProperty({example:'text text text...', description:'street'})
  @IsNotEmpty()
  description:string;
  @ApiProperty({example:100, description:'price'})
  @IsNotEmpty()
  about:string;
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'image balloon'
  })
  @IsNotEmpty()
  image: string;

}