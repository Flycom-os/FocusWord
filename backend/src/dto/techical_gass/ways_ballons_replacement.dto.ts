import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class Gass_ballon_replacementDto{
  @ApiProperty({example:'name', description:'name forKeeping station'})
  @IsNotEmpty()
  name: string;

  @ApiProperty({example:'name', description:'name'})
  ways: string;

  @ApiProperty({example:'address', description:'description replacement station'})
  @IsNotEmpty()
  description: string;

}