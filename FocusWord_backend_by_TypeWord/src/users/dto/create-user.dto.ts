import { RegisterUserDto } from './register-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateUserDto extends RegisterUserDto {
  @ApiPropertyOptional({ example: 1, description: 'id роли' })
  @IsInt()
  readonly role_id?: number;
}
