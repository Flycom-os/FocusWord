import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { RoleService } from './role.service'; // Adjust path as necessary
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from "../../jwt-auth.guard";
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoleDto } from "../../dto/roles/create-role.dto";
import { UpdateRoleDto } from "../../dto/roles/update-role.dto";
import { SearchRolesDto } from "../../dto/roles/search-roles.dto";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles('roles:2') // Full access (level 2) required for creating roles
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  @Roles('roles:0') // Read access (level 0) required for viewing all roles
  findAll(@Query() searchDto: SearchRolesDto) {
    return this.roleService.findAll(searchDto);
  }

  @Get(':id')
  @Roles('roles:0') // Read access (level 0) required for viewing a single role
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(+id);
  }

  @Patch(':id')
  @Roles('roles:1') // Read/Update access (level 1) required for updating roles
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleService.update(+id, updateRoleDto);
  }

  @Delete(':id')
  @Roles('roles:2') // Full access (level 2) required for deleting roles
  remove(@Param('id') id: string) {
    return this.roleService.remove(+id);
  }
}
