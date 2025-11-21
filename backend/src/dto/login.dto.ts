import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength } from "class-validator";


export class LoginDto{
  @ApiProperty({example:'login@example.com', description:'Email или телефон'})
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({example:'mypassword', description:'Password (min 6 characters long)'})
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}