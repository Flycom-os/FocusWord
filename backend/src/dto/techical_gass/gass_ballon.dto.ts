import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class Gass_ballonDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',  // Indicates that this is binary data (file)
    description: 'Image (file)'
  })
  @IsNotEmpty()
  image: string;

  @ApiProperty({example:'name', description:'name'})
  @IsNotEmpty()
  name: string;

  @ApiProperty({example:'5 10 15 30', description:'volume'})
  volume: string;

  @ApiProperty({example:'something...', description:'description'})
  @IsNotEmpty()
  description: string

}