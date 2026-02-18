import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // requiredPermissions will now be an array of strings like ['roles:2', 'users:1']
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // If no specific permissions are defined, access is granted (no restrictions)
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // User object attached by JwtAuthGuard

    // Ensure user and user.role and user.role.permissions exist
    if (!user || !user.role || !user.role.permissions || !Array.isArray(user.role.permissions)) {
      return false; // Deny access if permission data is missing
    }

    // Check if the user has at least one of the required permissions
    return requiredPermissions.some(requiredPerm => {
      const [requiredModuleName, requiredLevelStr] = requiredPerm.split(':');
      const requiredLevel = parseInt(requiredLevelStr, 10);

      // Find the user's permission for this module
      const userPerm = user.role.permissions.find(perm => perm.startsWith(`${requiredModuleName}:`));

      if (!userPerm) {
        return false; // User does not have any permission for this module
      }

      const userLevelStr = userPerm.split(':')[1];
      const userLevel = parseInt(userLevelStr, 10);

      // Check if the user's level is sufficient for this required permission
      return userLevel >= requiredLevel;
    });
  }
}
