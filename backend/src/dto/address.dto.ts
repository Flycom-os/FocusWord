import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Pushkina st., 1, apt. 10', description: 'address' })
  @IsString()
  address: string;
  @ApiProperty({
    example: 'Lenina st., 5, apt. 20',
    description: 'new address',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: number;
}

export class UpdateAddressDto {
  @ApiProperty({
    example: 'Lenina st., 5, apt. 20',
    description: 'new address',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
  @ApiProperty({
    example: 'Lenina st., 5, apt. 20',
    description: 'new address',
    required: false,
  })
  @IsOptional()
  @IsString()
  userId?: number;
}

export class GetAddressesDto {
  @ApiProperty({ example: '1', description: 'user id filter', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ example: '0', description: 'page number', required: false })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    example: '10',
    description: 'items per page',
    required: false,
  })
  @IsOptional()
  @IsString()
  limit?: string;
}
