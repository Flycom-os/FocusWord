import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";


export class ProductDto{
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
  @ApiProperty({example:'open | new | default', description:'status forKeeping'})
  color: string;
  @ApiProperty({example:'100', description:'street'})
  volume: string
  @ApiProperty({example:100, description:'price'})
  amount: number;
  @ApiProperty({example:100, description:'price in offer'})
  count: number;
  @ApiProperty({example:100, description:'position1'})
  quantity: number;
  @ApiProperty({example:100, description:'position2'})
  total_count: number;
  @ApiProperty({example:100, description:'position3'})
  categoryId: number;
}
export class CategoryDto{z
  @ApiProperty({example:'name', description:'name'})
  @IsNotEmpty()
  icon: string;
  @ApiProperty({example:'open | new | default', description:'status forKeeping'})
  name: string;
}
export class ProductSizeDto{
  @ApiProperty({example:0, description:'name'})
  @IsNotEmpty()
  size: number;
  @ApiProperty({example:'open | new | default', description:'status forKeeping'})
  name: string;
}
export class SizesProductDto{
  @ApiProperty({example:0, description:'name'})
  @IsNotEmpty()
  productSizeId: number;
  @ApiProperty({example:0, description:'status forKeeping'})
  productId: number;
}