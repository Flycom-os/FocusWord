import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './role.model';
import { UpdateRoleDto } from './dto/update-role.dto';
import {
  ForbiddenAccessExceptionResponse,
  ForbiddenRoleDeleteExceptionResponse,
  ForbiddenSystemRoleDeleteExceptionResponse,
} from './responses/roles.forbidden.responses';
import { RoleNotFoundExceptionResponse, RolesNotFoundExceptionResponse } from './responses/roles.not-found.responses';
import { RoleConflictExceptionResponse } from './responses/roles.conflict.responses';
import { User } from '../users/user.model';
import sequelize, { Op } from 'sequelize';
import { UsersService } from '../users/users.service';
import { DeleteOkResponse, PagesOkResponse } from './responses/roles.ok.responses';
import { FilterRoleDto } from './dto/filter-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private roleRepository: typeof Role,
    @Inject(forwardRef(() => UsersService))
    private userService: UsersService,
  ) {}

  /**check for roles in the database*/
  private async _rolesIdExistsCheck(roles_ids: number[]): Promise<Role[]> {
    const roles: Role[] = await this.roleRepository.findAll({
      where: { id: roles_ids },
      include: { all: true },
    });
    if (roles.length !== roles_ids.length) {
      roles.forEach((role: Role): void => {
        const index: number = roles_ids.indexOf(role.id);
        roles_ids.splice(index, 1);
      });
      throw new RolesNotFoundExceptionResponse(roles_ids);
    }
    return roles;
  }

  /**getting all roles from database*/
  async getRoles(): Promise<Role[]> {
    return await this.roleRepository.findAll({
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
    });
  }

  /**getting role by ID from database*/
  async getRoleById(id: number): Promise<Role> {
    return await this.roleRepository.findOne({
      where: { id },
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
    });
  }

  /**getting role by "name" from database*/
  async getRoleByName(name: string): Promise<Role> {
    return await this.roleRepository.findOne({ where: { name } });
  }

  /**getting roles for paggaination*/
  async getRolesPagination(page: number, per_page: number, filterRole: FilterRoleDto): Promise<PagesOkResponse> {
    if (filterRole.name) {
      filterRole.name = { [Op.substring]: filterRole.name };
    }
    const offset: number = (page - 1) * per_page;
    const roleCount: number = await this.roleRepository.count();
    return await this.roleRepository
      .findAll({
        where: { ...filterRole },
        offset: offset,
        limit: per_page,
        order: ['createdAt'],
        include: [
          {
            model: User,
            as: 'users',
            attributes: [],
          },
        ],
        group: ['Role.id'],
        subQuery: false,

        attributes: {
          include: [[sequelize.fn('COUNT', sequelize.col('users')), 'usersCount']],
          exclude: [
            'can_ban_users',
            'can_manage_roles',
            'content_control',
            'content_control',
            'is_system_role',
            'seo_control',
            'updatedAt',
            'createdAt',
          ],
        },
      })
      .then(
        (rows: Role[], count: number = roleCount): PagesOkResponse => ({
          total_pages: Math.ceil(count / per_page),
          rows: rows,
        }),
      );
  }

  /**create new role*/
  async createRole(dto: CreateRoleDto, request_user_id?: number): Promise<Role> {
    const role_exist: Role = await this.roleRepository.findOne({
      where: { name: dto.name },
    });
    //role check in the database
    if (role_exist) {
      throw new RoleConflictExceptionResponse(dto.name);
    }
    const roles: Role[] = await this._rolesIdExistsCheck(dto.roles_id_access);
    if (request_user_id) {
      const user: User = await this.userService.getUserById(request_user_id);
      for (const role_id of dto.roles_id_access) {
        await this.rolesAccessCheck([role_id], user);
      }
      const role: Role = await this.roleRepository.create(dto);
      await user.role.$add('roles_accessed', [role.id]);
      await role.$set('role_creator', user.id);
      await role.$set('roles_accessed', [...roles]);
      return role;
    }
    const role: Role = await this.roleRepository.create(dto);
    await role.$set('roles_accessed', [...roles]);
    return role;
  }

  /**update information about role(role ID, user access ID)*/
  async updateRole(dto: UpdateRoleDto, role_id: number, user_id: number): Promise<Role> {
    await this.rolesAccessCheck([role_id], user_id);
    if (dto.accesses && 'publish_posts' in dto.accesses && dto.accesses.publish_posts) {
      dto.accesses.save_posts = true;
    }
    const role: Role = await this.roleRepository.findOne({
      where: { id: role_id },
    });
    if (!role) {
      throw new RoleNotFoundExceptionResponse(role_id);
    }
    if (role.system_role) {
      throw new ForbiddenAccessExceptionResponse();
    }
    if (dto.roles_to_access) {
      await role.$set('roles_accessed', await this._rolesIdExistsCheck(dto.roles_to_access));
    }
    return await this.roleRepository
      .update(dto, { where: { id: role_id }, returning: true })
      .then((response: [affectedCount: number, affectedRows: Role[]]) => response[1][0]);
  }

  /**deleting role by user id*/
  async deleteRoles(role_id: number[], user_id: number): Promise<DeleteOkResponse> {
    await this.rolesAccessCheck(role_id, user_id);
    const roles: Role[] = await this.roleRepository.findAll({
      where: { id: role_id },
    });
    const roles_names: string[] = [];
    for (const role of roles) {
      if (!role) {
        throw new RolesNotFoundExceptionResponse(role_id);
      }
      if (role.system_role === true) {
        throw new ForbiddenSystemRoleDeleteExceptionResponse();
      }
      if (role.users) {
        throw new ForbiddenRoleDeleteExceptionResponse();
      }
      roles_names.push(role.name);
    }
    await this.roleRepository.destroy({ where: { id: role_id } });
    return new DeleteOkResponse(roles_names);
  }

  /**user verification of role access */
  async rolesAccessCheck(roles_ids: number[], user: number | User): Promise<User> {
    if (typeof user === 'number') {
      user = await this.userService.getUserById(user);
    }
    if (user.superuser) {
      return user;
    }
    if ('all_roles_access' in user.role.accesses && user.role.accesses.all_roles_access) {
      return user;
    }
    if (typeof user.role.roles_accessed === 'undefined') {
      throw new ForbiddenAccessExceptionResponse();
    }
    for (const role of user.role.roles_accessed) {
      if (!(role.id in roles_ids)) {
        throw new ForbiddenAccessExceptionResponse();
      }
    }
    return user;
  }
}
