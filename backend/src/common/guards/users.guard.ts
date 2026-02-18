import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt'; // Import JwtService

@Injectable()
export class UsersGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required levels from the @Roles decorator
    const requiredLevels = this.reflector.get<number[]>('users', context.getHandler());

    if (!requiredLevels || requiredLevels.length === 0) {
      return true; // No roles specified, so allow access
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role || !Array.isArray(user.role.permissions)) {
      return false; // User or user's role/permissions not found
    }

    // Assume the resource is 'roles' for now, given the context of the problem
    const resource = 'users'; // This needs to be dynamic in a real-world scenario

    // Find the user's permission level for the specified resource
    let userLevelForResource: number | undefined;
    user.role.permissions.forEach(p => {
      const [permResource, levelStr] = p.split(':');
      if (permResource === resource) {
        const level = parseInt(levelStr, 10);
        if (!isNaN(level)) {
          userLevelForResource = level;
        }
      }
    });

    if (userLevelForResource === undefined) {
      return false; // User does not have any permission defined for this resource
    }

    // Check if the user's level is among the required levels
    return requiredLevels.includes(userLevelForResource);
  }
}
