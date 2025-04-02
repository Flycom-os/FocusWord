import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from './role.model';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesForbiddenResponse } from './responses/roles.forbidden.responses';
import { RoleNotFoundResponse } from './responses/roles.not-found.responses';
import { UnauthorizedExceptionResponse } from '../auth/responses/auth.unauthorized.responses';
import { RolesConflictResponse } from './responses/roles.conflict.responses';
import { UserId } from '../decorators/user-id.decorator';
import { DeleteOkResponse, PagesOkResponse } from './responses/roles.ok.responses';
import { RoleProperties } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { FilterRoleDto } from './dto/filter-role.dto';
import { DeleteRolesDto } from './dto/delete-roles.dto';
import { UnprocessableEntityResponse } from '../responses/validation.response';

@ApiTags('Роли')
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

//POST
  /**creating role*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Создание роли' })
  @ApiOkResponse({ type: Role })
  @ApiCreatedResponse({ type: Role })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: RolesForbiddenResponse })
  @ApiConflictResponse({ description: 'Error: Conflict', type: RolesConflictResponse })
  @Post('/create_role')
  async create_role(@Body() createRoleDTO: CreateRoleDto, @UserId() request_user_id: number): Promise<Role> {
    return await this.rolesService.createRole(createRoleDTO, request_user_id);
  }

//PATCH
  /**role update by ID*/
  @RoleProperties({ admin_panel_access: true, roles_management: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление роли' })
  @ApiOkResponse({ type: Role })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: RolesForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: RoleNotFoundResponse })
  @Patch('/update_role/:id')
  async update_role(
    @Param('id', new ParseIntPipe()) role_id: number,
    @Body() updatedRole: UpdateRoleDto,
    @UserId() request_user_id: number,
  ): Promise<Role> {
    return await this.rolesService.updateRole(updatedRole, role_id, request_user_id);
  }
//GET
  /**getting all roles*/
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение всех ролей' })
  @ApiOkResponse({ type: [Role] })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: RolesForbiddenResponse })
  @Get('/roles')
  async get_roles(): Promise<Role[]> {
    return await this.rolesService.getRoles();
  }

  /**getting roles for paggaination*/
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение ролей с пагинацией' })
  @ApiOkResponse({ type: PagesOkResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: RolesForbiddenResponse })
  @Get('/roles/pagination/:page/:per_page')
  async get_roles_pagination(
    @Param('page', new ParseIntPipe()) page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
    @Query() filterRole: FilterRoleDto,
  ): Promise<PagesOkResponse> {
    return await this.rolesService.getRolesPagination(page, per_page, filterRole);
  }

  /**getting role by ID*/
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение роли по id' })
  @ApiOkResponse({ type: Role })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: RolesForbiddenResponse })
  @Get('/roles/role/:id')
  async getRoleById(@Param('id', new ParseIntPipe()) id: number): Promise<Role> {
    return await this.rolesService.getRoleById(id);
  }

//DELETE
  /**deletion of one or more roles*/
  @RoleProperties({ admin_panel_access: true, roles_management: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление роли' })
  @ApiOkResponse({ type: DeleteOkResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: RolesForbiddenResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: RoleNotFoundResponse })
  @Delete('/delete_roles/:ids')
  async delete_roles(@Body() roles_ids: DeleteRolesDto, @UserId() request_user_id: number): Promise<DeleteOkResponse> {
    return await this.rolesService.deleteRoles(roles_ids.ids, request_user_id);
  }
}
