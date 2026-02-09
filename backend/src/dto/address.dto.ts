import { IsOptional, IsString, IsInt } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAddressDto {
  @ApiProperty({example: 'ул. Пушкина, д. 1, кв. 10', description: 'адрес'})
  @IsString()
  address: string;
  @ApiProperty({example: 'ул. Ленина, д. 5, кв. 20', description: 'новый адрес', required: false})
  @IsOptional()
  @IsString()
  userId?: number;
}

export class UpdateAddressDto {
  @ApiProperty({example: 'ул. Ленина, д. 5, кв. 20', description: 'новый адрес', required: false})
  @IsOptional()
  @IsString()
  address?: string;
  @ApiProperty({example: 'ул. Ленина, д. 5, кв. 20', description: 'новый адрес', required: false})
  @IsOptional()
  @IsString()
  userId?: number;
}

export class GetAddressesDto {
  @ApiProperty({example: '1', description: 'user id filter', required: false})
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({example: '0', description: 'page number', required: false})
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({example: '10', description: 'items per page', required: false})
  @IsOptional()
  @IsString()
  limit?: string;
}
