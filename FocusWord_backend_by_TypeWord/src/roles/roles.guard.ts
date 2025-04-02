import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.model';
import { ForbiddenAccessExceptionResponse } from './responses/roles.forbidden.responses';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride('properties', [context.getHandler(), context.getClass()]);
    if (!requiredRoles) {
      return true;
    }
    let { user } = context.switchToHttp().getRequest();
    const user_from_request = async (): Promise<User> => {
      user = await this.usersService.getUserById(user.id);
      return user;
    };
    const current_user: User = await user_from_request();
    if (current_user.superuser) {
      return true;
    }
    if ('all_roles_access' in current_user.role.accesses && current_user.role.accesses.all_roles_access) {
      return true;
    }
    for (const [key, value] of Object.entries(requiredRoles)) {
      if (!(key in current_user.role.accesses)) {
        throw new ForbiddenAccessExceptionResponse();
      }
      if (current_user.role.accesses[key] !== value) {
        throw new ForbiddenAccessExceptionResponse();
      }
    }
    return true;
  }
}
