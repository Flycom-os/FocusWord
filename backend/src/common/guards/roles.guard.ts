import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt'; // Import JwtService

const PERMISSION_LEVEL_SETS = {
  '0': new Set(['read']),
  '1': new Set(['read', 'create', 'update']),
  '2': new Set(['read', 'create', 'delete']), // As per user's description
  // Add other levels if necessary
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {} // Inject JwtService

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // This 'user' object should now contain 'permissions' from the JWT payload

    if (!user || !user.role || !Array.isArray(user.role.permissions)) {
      return false; // User or user's role/permissions not found
    }

    const userPermissionsMap = new Map<string, number>();
    user.role.permissions.forEach(p => {
      const [resource, levelStr] = p.split(':');
      const level = parseInt(levelStr, 10);
      if (!isNaN(level)) {
        // Simple singularization for matching, adjust if more complex logic is needed
        const canonicalResource = resource.endsWith('s') && resource !== 'news' ? resource.slice(0, -1) : resource;
        userPermissionsMap.set(canonicalResource, level);
      }
    });

    return requiredPermissions.some(rp => {
      const [requiredResource, requiredAction] = rp.split(':');

      const userLevel = userPermissionsMap.get(requiredResource);

      if (userLevel === undefined) {
        return false; // User does not have any permission defined for this resource
      }

      const allowedActions = PERMISSION_LEVEL_SETS[userLevel.toString()];
      if (!allowedActions) {
        return false; // Invalid permission level defined for the user
      }

      return allowedActions.has(requiredAction);
    });
  }
}
