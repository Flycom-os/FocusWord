import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role', example: 'Admin' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'The description of the role', example: 'Administrator role with full access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'An array of permissions for the role, in the format "resource:level" (e.g., "users:2", "news:1"). Level can be 0 (read), 1 (read/create/update), or 2 (read/create/delete).',
    example: ['users:2', 'roles:2', 'news:1'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions: string[] = [];
}
