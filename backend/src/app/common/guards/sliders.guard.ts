import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { SLIDERS_ACCESS_KEY } from '../decorators/sliders.decorator';

@Injectable()
export class SlidersGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredAccessLevel = this.reflector.getAllAndOverride<number>(SLIDERS_ACCESS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no specific access level is defined, grant access (no restrictions)
    if (requiredAccessLevel === undefined || requiredAccessLevel === null) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // User object attached by JwtAuthGuard

    // Deny access if user or user role/permissions are missing
    if (!user || !user.role || !user.role.permissions || !Array.isArray(user.role.permissions)) {
      return false;
    }

    // Find the user's 'sliders' permission
    const userSlidersPermission = user.role.permissions.find(perm =>
      perm.startsWith('sliders:'),
    );

    // If user doesn't have 'sliders' permission, deny access
    if (!userSlidersPermission) {
      return false;
    }

    const userAccessLevel = parseInt(userSlidersPermission.split(':')[1], 10);

    // Check if the user's access level is sufficient
    return userAccessLevel >= requiredAccessLevel;
  }
}
