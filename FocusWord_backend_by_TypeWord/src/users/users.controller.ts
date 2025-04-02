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
import {
  ApiBadRequestResponse,
  ApiExcludeEndpoint,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UpdateUserSelfDto } from './dto/update-user-self.dto';
import { UserId } from '../decorators/user-id.decorator';
import { BanUsersAdminDto } from './dto/ban-user-admin.dto';
import { UpdateUserRoleAdminDto } from './dto/update-user-role-admin.dto';
import {
  BanUsersResponse,
  DeleteSelfResponse,
  DeleteUsersResponse,
  PagesUsersOkResponse,
  UnbanUsersResponse,
  UpdateSelfResponse,
} from './responses/users.ok.responses';
import { UnauthorizedExceptionResponse } from '../auth/responses/auth.unauthorized.responses';
import { ForbiddenAccessExceptionResponse } from '../roles/responses/roles.forbidden.responses';
import { UsersNotFoundResponse } from './responses/users.not-found.responses';
import { RoleProperties } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import { FilterUserDto } from './dto/filter-user.dto';
import { DeleteUsersDto } from './dto/delete-users.dto';
import { FullLogoutUsersDto } from './dto/full-logout-users.dto';
import { UnprocessableEntityResponse } from '../responses/validation.response';

@ApiTags('Пользователи')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}
  //POST
  /**create new super user */
  @RoleProperties({ admin_panel_access: true, create_users: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UsePipes(new ValidationPipe())
  @ApiExcludeEndpoint()
  @Post('/create_user')
  async createUser(@Body() userDTO: CreateUserDto, @UserId() request_user_id: number): Promise<User> {
    return await this.userService.createUser(userDTO, request_user_id);
  }
  //GET
  /**getting all users */
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение всех пользователей' })
  @ApiOkResponse({ type: [User] })
  @ApiUnauthorizedResponse({ type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ type: ForbiddenAccessExceptionResponse })
  @Get('')
  async getAllUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  /**getting user by Id */
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение пользователя по id' })
  @ApiOkResponse({ type: User })
  @ApiUnauthorizedResponse({ type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ type: ForbiddenAccessExceptionResponse })
  @Get('user/:id')
  async getUserById(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    return await this.userService.getUserById(id);
  }

  /**getting users for paggination */
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Получение пользователей с пагинацией' })
  @ApiOkResponse({ type: PagesUsersOkResponse })
  @ApiUnauthorizedResponse({ type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ type: ForbiddenAccessExceptionResponse })
  @Get('/pagination/:page/:per_page')
  async getUsersPagination(
    @Param('page', new ParseIntPipe()) page: number,
    @Param('per_page', new ParseIntPipe()) per_page: number,
    @Query() userFilter: FilterUserDto,
  ): Promise<PagesUsersOkResponse> {
    return await this.userService.getUsersPagination(page, per_page, userFilter);
  }

  //PATCH

  /**Updating user role by id by administrator */
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, update_users: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Обновление администратором роли пользователя по id' })
  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: UsersNotFoundResponse })
  @Patch('/update-user-role/:id')
  async patchUser(
    @Body() updatedUserDto: UpdateUserRoleAdminDto,
    @Param('id', new ParseIntPipe()) user_id: number,
    @UserId() request_user_id: number,
  ): Promise<User> {
    return await this.userService.updateUserRole(updatedUserDto, user_id, request_user_id);
  }

  /**Control of user(s) blocking by id */
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, ban_users: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Управление блокировкой пользователя(-ей) по id' })
  @ApiOkResponse({ type: BanUsersResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: UsersNotFoundResponse })
  @Patch('/ban-user-management')
  async banUser(
    @Body() banUsersAdminDto: BanUsersAdminDto,
    @UserId() request_user_id: number,
  ): Promise<BanUsersResponse | UnbanUsersResponse> {
    return await this.userService.banUserManagement(banUsersAdminDto, request_user_id);
  }

  /**Unlogging user(s) by id */
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, logout_users: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Разлогирование пользователя(-ей) по id' })
  @Patch('/full-logout')
  async fullLogoutUsers(@Body() dto: FullLogoutUsersDto, @UserId() request_user_id: number): Promise<void> {
    return await this.userService.logoutUsers(dto.ids, request_user_id);
  }

  /**Updating the user's data */
  @UsePipes(new ValidationPipe())
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Обновление пользователем своих данных' })
  @ApiOkResponse({ type: UpdateSelfResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @Patch('/update/me')
  async patchMe(
    @Body() updatedUserDto: UpdateUserSelfDto,
    @UserId() request_user_id: number,
  ): Promise<UpdateSelfResponse> {
    return await this.userService.updateUserSelf(updatedUserDto, request_user_id);
  }
  //DELETE

  /**Deleting user(s) by id */
  @UsePipes(new ValidationPipe())
  @RoleProperties({ admin_panel_access: true, delete_users: true })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Удаление пользователя(-ей) по id' })
  @ApiOkResponse({ type: DeleteUsersResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @ApiNotFoundResponse({ description: 'Error: Not Found', type: UsersNotFoundResponse })
  @Delete('/delete')
  async deleteUser(@Body() ids: DeleteUsersDto, @UserId() request_user_id: number): Promise<DeleteUsersResponse> {
    return await this.userService.deleteUsers(ids, request_user_id);
  }

  /**Deleting a user's account */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Удаление пользователем своего аккаунта' })
  @ApiOkResponse({ type: DeleteSelfResponse })
  @ApiBadRequestResponse({ status: 400, description: 'Error: Validation', type: UnprocessableEntityResponse })
  @ApiUnauthorizedResponse({ description: 'Error: Unauthorized', type: UnauthorizedExceptionResponse })
  @ApiForbiddenResponse({ description: 'Error: Forbidden', type: ForbiddenAccessExceptionResponse })
  @Delete('/delete/me')
  async deleteMe(@UserId() request_user_id: number): Promise<DeleteSelfResponse> {
    return await this.userService.deleteSelf(request_user_id);
  }
}
