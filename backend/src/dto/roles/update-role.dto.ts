import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ description: 'The name of the role', example: 'Admin', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'The description of the role', example: 'Administrator role with full access', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'An array of permissions for the role, in the format "resource:level" (e.g., "users:2", "news:1"). Level can be 0 (read), 1 (read/create/update), or 2 (read/create/delete).',
    example: ['users:2', 'roles:2', 'news:1'],
    type: [String],
    required: false
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissions?: string[];
}
