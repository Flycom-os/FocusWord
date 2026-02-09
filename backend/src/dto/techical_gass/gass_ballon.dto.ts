import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class Gass_ballonDto{
  @ApiProperty({
    type: 'string',
    format: 'binary',  // Указываем, что это бинарные данные (файл)
    description: 'Изображение (файл)'
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