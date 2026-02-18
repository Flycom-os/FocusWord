import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true; // No permissions required for this route
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assuming user is attached to the request by an AuthGuard

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const userWithRole = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!userWithRole || !userWithRole.role) {
      throw new UnauthorizedException('User does not have an assigned role');
    }

    const userPermissions = userWithRole.role.permissions;

    for (const requiredPermission of requiredPermissions) {
      const [resource, level] = requiredPermission.split(':');
      const requiredLevel = parseInt(level, 10);

      const hasPermission = userPermissions.some(p => {
        const [userResource, userLevel] = p.split(':');
        return userResource === resource && parseInt(userLevel, 10) >= requiredLevel;
      });

      if (!hasPermission) {
        throw new UnauthorizedException(`Missing permission: ${requiredPermission}`);
      }
    }

    return true;
  }
}
