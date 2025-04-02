
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { User } from './user.model';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserSelfDto } from './dto/update-user-self.dto';
import { InjectModel } from '@nestjs/sequelize';
import { RolesService } from '../roles/roles.service';
import { BanUsersAdminDto } from './dto/ban-user-admin.dto';
import * as bcrypt from 'bcryptjs';
import { UpdateUserRoleAdminDto } from './dto/update-user-role-admin.dto';
import { Role } from '../roles/role.model';
import { ConflictExceptionResponse } from './responses/users.conflict.responses';
import { RegisterUserDto } from './dto/register-user.dto';
import {
  BanUsersResponse,
  DeleteSelfResponse,
  DeleteUsersResponse,
  PagesUsersOkResponse,
  UnbanUsersResponse,
  UpdateSelfResponse,
} from './responses/users.ok.responses';
import { RoleNotFoundExceptionResponse } from '../roles/responses/roles.not-found.responses';
import { UsersNotFoundResponse } from './responses/users.not-found.responses';
import { UserForbiddenResponse } from './responses/users.forbidden.responses';
import { FilterUserDto } from './dto/filter-user.dto';
import { Op } from 'sequelize';
import { DeleteUsersDto } from './dto/delete-users.dto';
import { UserInternalServerError } from './responses/users.internal-servere-error';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private UserRepository: typeof User,
    @Inject(forwardRef(() => RolesService))
    private roleService: RolesService,
  ) {}

  /**get all users from database */
  async getAllUsers(): Promise<User[]> {
    return await this.UserRepository.findAll({
      attributes: {
        exclude: ['password', 'refresh_token', 'role_id'],
      },
      order: ['createdAt'],
      include: [
        {
          model: Role,
          as: 'role',
          attributes: {
            exclude: ['system_role'],
          },
          include: [
            {
              model: User,
              as: 'role_creator',
              attributes: ['id', 'name'],
            },
            {
              model: Role,
              as: 'roles_accessed',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });
  }

  /**get information user by ID with accesses */
  async getUserByIdToken(id: number): Promise<User> {
    return await this.UserRepository.findOne({
      where: { id },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: { exclude: ['createdAt', 'updatedAt'] },

          include: [
            {
              model: Role,
              as: 'roles_accessed',
              attributes: ['id', 'name', 'accesses'],
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    });
  }

  /**get information user by email with accesses */
  async getUserByEmailToken(email: string): Promise<User> {
    return await this.UserRepository.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: { exclude: ['createdAt', 'updatedAt'] },

          include: [
            {
              model: Role,
              as: 'roles_accessed',
              attributes: ['id', 'name', 'accesses'],
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    });
  }

  /**get information user by email without accesses */
  async getUserByEmail(email: string): Promise<User> {
    return await this.UserRepository.findOne({
      where: { email },
      attributes: {
        exclude: ['password', 'refresh_token', 'role_id'],
      },

      include: [
        {
          model: Role,
          as: 'role',
          attributes: { exclude: ['is_system_role'] },

          include: [
            {
              model: Role,
              as: 'roles_accessed',
              attributes: ['id', 'name'],
              through: {
                attributes: [],
              },
            },
          ],
        },
      ],
    });
  }

  /**get information user by ID without accesses */
  async getUserById(id: number): Promise<User> {
    return await this.UserRepository.findOne({
      where: { id },
      include: [
        {
          model: Role,
          as: 'role',
        },
      ],
    });
  }

  /**get users for paggination */
  async getUsersPagination(page: number, per_page: number, userFilter: FilterUserDto): Promise<PagesUsersOkResponse> {
    if (userFilter.name) {
      userFilter.name = { [Op.substring]: userFilter.name };
    }
    const offset: number = (page - 1) * per_page;
    return await this.UserRepository.findAndCountAll({
      limit: per_page,
      offset: offset,
      where: { ...userFilter },
      attributes: ['id', 'name', 'email', 'createdAt'],
      include: {
        model: Role,
        as: 'role',
        attributes: ['id', 'name', 'system_role'],
      },
      order: ['createdAt'],
    }).then(
      (rows): PagesUsersOkResponse => ({
        total_pages: Math.ceil(rows.count / per_page),
        rows: rows.rows,
      }),
    );
  }

  /**registration new user */
  async registerUser(registerUserDTO: RegisterUserDto): Promise<number> {
    const user_exist: User = await this.getUserByEmail(registerUserDTO.email);
    if (user_exist) {
      throw new ConflictExceptionResponse();
    }
    const role: Role = await this.roleService.getRoleByName('Пользователь');
    const passwordHash = await bcrypt.hash(registerUserDTO.password, 5);
    if (!role) {
      return await this.initializeRolesAndUser(registerUserDTO, passwordHash);
    }
    try {
      const user: User = await this.UserRepository.create({
        ...registerUserDTO,
        password: passwordHash,
      });
      await user.$set('role', [role.id]);
      return user.id;
    } catch (e) {
      throw new UserInternalServerError();
    }
  }

  /**creating new user another user's */
  async createUser(createUserDto: CreateUserDto, request_user_id: number): Promise<User> {
    const user_extends: User = await this.getUserByEmail(createUserDto.email);
    if (user_extends) {
      throw new ConflictExceptionResponse();
    }
    if (createUserDto.role_id) {
      await this.roleService.rolesAccessCheck([createUserDto.role_id], request_user_id);
      const role: Role = await this.roleService.getRoleById(createUserDto.role_id);
      if (!role) {
        throw new RoleNotFoundExceptionResponse(createUserDto.role_id);
      }
    }
    return await this.UserRepository.create(createUserDto);
  }

  /**user blocking management */
  async banUserManagement(
    dto: BanUsersAdminDto,
    request_user_id: number,
  ): Promise<BanUsersResponse | UnbanUsersResponse> {
    const usersToBan: User[] = await this.usersIdExistsCheck(dto.ids);
    const usersRolesIds: number[] = usersToBan.map((user: User) => user.role_id);
    await this.roleService.rolesAccessCheck(usersRolesIds, request_user_id);
    const usersNames: string[] = await this.UserRepository.update(
      { ...dto, refresh_token: null },
      { where: { id: dto.ids }, returning: true },
    ).then((response: [affectedCount: number, affectedRows: User[]]) => response[1].map((user: User) => user.name));
    if (dto.is_banned) {
      return new BanUsersResponse(usersNames, dto.ban_reason);
    }
    return new UnbanUsersResponse(usersNames);
  }

  /**updating the user's personal information */
  async updateUserSelf(dto: UpdateUserSelfDto, request_user_id: number): Promise<UpdateSelfResponse> {
    await this.UserRepository.update(dto, { where: { id: request_user_id } });
    return new UpdateSelfResponse();
  }

  /**updating user access roles by another user */
  async updateUserRole(dto: UpdateUserRoleAdminDto, user_id: number, request_user_id: number): Promise<User> {
    const updatingUser: User = await this.getUserById(user_id);
    if (!updatingUser) {
      throw new UsersNotFoundResponse(user_id);
    }
    const role: Role = await this.roleService.getRoleById(dto.role_id);
    if (!role) {
      throw new RoleNotFoundExceptionResponse(dto.role_id);
    }
    await this.roleService.rolesAccessCheck([role.id], request_user_id);
    return await this.UserRepository.update(dto, {
      where: { id: user_id },
      returning: true,
    }).then((response: [affectedCount: number, affectedRows: User[]]) => response[1][0]);
  }

  /**deleting one or more user's */
  async deleteUsers(
    usersIds: DeleteUsersDto,
    request_user_id: number,
  ): Promise<DeleteSelfResponse | DeleteUsersResponse> {
    const usersToDelete: User[] = await this.usersIdExistsCheck(usersIds.ids);
    const requestUser: User = await this.getUserById(request_user_id);
    const usersToDeleteRolesIds: number[] = usersToDelete.map((user: User) => {
      if (user.superuser) {
        throw new UserForbiddenResponse();
      }
      if (user.id === request_user_id) {
        throw new HttpException('Удалить свой аккаунт можно только в настройках своего аккаунта', HttpStatus.FORBIDDEN);
      }
      return user.role.id;
    });
    await this.roleService.rolesAccessCheck(usersToDeleteRolesIds, requestUser);
    await this.UserRepository.destroy({ where: { id: usersIds.ids } });
    return new DeleteUsersResponse(usersToDelete.map((user: User) => user.name));
  }

  /**logout user and clear refresh token */
  async logoutUsers(ids: number[], request_user_id: number): Promise<void> {
    const usersToLogout: User[] = await this.usersIdExistsCheck(ids);
    const requestUser: User = await this.UserRepository.findOne({ where: { id: request_user_id } });
    await this.roleService.rolesAccessCheck(
      usersToLogout.map((user: User) => user.role_id),
      requestUser,
    );
    await this.updateUserRefreshTokenById(ids, null);
  }

  /**self deleting user */
  async deleteSelf(user_id: number): Promise<DeleteSelfResponse> {
    const user: User = await this.UserRepository.findOne({ where: { id: user_id } });
    if (user.superuser) {
      throw new UserForbiddenResponse();
    }
    await this.UserRepository.destroy({ where: { id: user_id } });
    return new DeleteSelfResponse();
  }

  /**update refresh token by ID */
  async updateUserRefreshTokenById(id: number | number[], refresh_token: string): Promise<void> {
    await this.UserRepository.update({ refresh_token }, { where: { id: id } });
  }

  /**update refresh token by email */
  async updateUserRefreshTokenByEmail(id: number, refresh_token: string): Promise<void> {
    await this.UserRepository.update({ refresh_token }, { where: { id: id } });
  }

  /**user id's check */
  private async usersIdExistsCheck(usersIds: number[]): Promise<User[]> {
    const users: User[] = await this.UserRepository.findAll({
      where: { id: usersIds },
      include: { all: true },
    });
    if (users.length !== usersIds.length) {
      users.forEach((role: User): void => {
        const index: number = usersIds.indexOf(role.id);
        usersIds.splice(index, 1);
      });
      throw new UsersNotFoundResponse(usersIds);
    }
    return users;
  }

  /**first initialization of roles for the user */
  private async initializeRolesAndUser(createUserDTO: CreateUserDto, passwordHash: string): Promise<number> {
    await this.roleService.createRole({
      name: 'Пользователь',
      system_role: true,
      roles_id_access: [],
    });
    const user: User = await this.UserRepository.create({
      ...createUserDTO,
      password: passwordHash,
      superuser: true,
    });
    const role: Role = await this.roleService.createRole({
      name: 'Главный администратор',
      system_role: true,
      roles_id_access: [],
    });
    await user.$set('role', role.id);
    return user.id;
  }
}
