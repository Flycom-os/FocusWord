import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class BallonServiceDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'image balloon'
  })
  @IsNotEmpty()
  icon: string;

  @ApiProperty({example:'name', description:'service name'})
  @IsNotEmpty()
  service: string;

  @ApiProperty({example:5, description:'price'})
  price: number;

}