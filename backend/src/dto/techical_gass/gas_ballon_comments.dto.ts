import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class Gass_ballon_commentsDto{
  @ApiProperty({example:'name', description:'name'})
  @IsNotEmpty()
  text: string;

  @ApiProperty({example:5, description:'volume'})
  raiting: number;

}