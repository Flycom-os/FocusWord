import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class BallonDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'image balloon'
  })
  @IsNotEmpty()
  image: string;

  @ApiProperty({example:'name', description:'name'})
  @IsNotEmpty()
  name: string;

  @ApiProperty({example:'5', description:'volume'})
  volume: string;

  @ApiProperty({example:'100', description:'price with promotion'})
  @IsNotEmpty()
  price_filling: string

  @ApiProperty({example:'190.', description:'default price'})
  @IsNotEmpty()
  price_buy: string

}