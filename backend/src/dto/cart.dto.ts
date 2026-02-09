import { IsOptional, IsString, IsInt, IsArray, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CartItemDto {
  @ApiProperty({example: 1, description: 'product id'})
  @IsInt()
  productId: number;

  @ApiProperty({example: 2, description: 'quantity'})
  @IsInt()
  quantity: number;
}

export class AddToCartDto {
  @ApiProperty({example: 1, description: 'product id'})
  @IsInt()
  productId: number;

  @ApiProperty({example: 2, description: 'quantity'})
  @IsInt()
  quantity: number;
}

export class UpdateCartItemDto {
  @ApiProperty({example: 2, description: 'new quantity'})
  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({example: 'ул. Пушкина, д. 1', description: 'delivery address'})
  @IsString()
  address: string;

  @ApiProperty({example: '2024-01-15', description: 'delivery date'})
  @IsString()
  date_delivery: string;

  @ApiProperty({example: '1000', description: 'total service cost'})
  @IsString()
  total_service: string;

  @ApiProperty({type: [CartItemDto], description: 'order items'})
  @IsArray()
  @ValidateNested({ each: true })

  items: CartItemDto[];
}

export class UpdateOrderDto {
  @ApiProperty({example: 'processing', description: 'order status', required: false})
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({example: 'ул. Пушкина, д. 1', description: 'delivery address', required: false})
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({example: '2024-01-15', description: 'delivery date', required: false})
  @IsOptional()
  @IsString()
  date_delivery?: string;

  @ApiProperty({example: '1000', description: 'total service cost', required: false})
  @IsOptional()
  @IsString()
  total_service?: string;
}

export class GetOrdersDto {
  @ApiProperty({example: '1', description: 'user id filter', required: false})
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({example: 'processing', description: 'status filter', required: false})
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({example: '0', description: 'page number', required: false})
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({example: '10', description: 'items per page', required: false})
  @IsOptional()
  @IsString()
  limit?: string;
}
