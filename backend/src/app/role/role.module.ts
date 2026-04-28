import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { PrismaService } from '../../../prisma/prisma.service'; // Adjust path as necessary
import { Reflector } from '@nestjs/core'; // Import Reflector
import { AuthModule } from '../../user/auth/auth.module'; // Add this line

@Module({
  imports: [AuthModule], // Add AuthModule here
  controllers: [RoleController],
  providers: [RoleService, PrismaService, Reflector],
  exports: [RoleService],
})
export class RoleModule implements OnModuleInit {
  private readonly logger = new Logger(RoleModule.name);

  constructor(
    private readonly roleService: RoleService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing default roles...');
    await this.createDefaultRoles();
  }

  private async createDefaultRoles() {
    const defaultRoles = [
      {
        name: 'Admin',
        description: 'Administrator role with full access to admin panel.',
        permissions: [
          'analytics:2',
          'products:2',
          'product-categories:2',
          'feedback:2',
          'media-files:2',
          'sliders:2',
          'records:2',
          'record-categories:2',
          'pages:2',
          'posts:2',
          'users:2',
          'roles:2',
          'profiles:2',
          'settings:2',
          'payment:2',
          'activity-logs:2',
          'structured-data:2',
          'blocks:2',
          'comments:2',
          'tags:2',
          'widgets:2',
          'seo:2'
        ],
      },
      {
        name: 'Editor',
        description: 'Editor role with full access to admin panel.',
        permissions: [
          'analytics:1',
          'products:1',
          'product-categories:1',
          'feedback:1',
          'media-files:1',
          'sliders:1',
          'records:1',
          'record-categories:1',
          'pages:1',
          'posts:1',
          'users:1',
          'roles:1',
          'profiles:2',
          'settings:2',
          'payment:1',
          'activity-logs:1',
          'structured-data:1',
          'blocks:1',
          'comments:1',
          'tags:1',
          'widgets:1',
          'seo:1'
        ],
      },
      {
        name: 'Reader',
        description: 'Reader role with read-only access to admin panel.',
        permissions: [
          'analytics:0',
          'products:0',
          'product-categories:0',
          'feedback:0',
          'media-files:0',
          'sliders:0',
          'records:0',
          'record-categories:0',
          'pages:0',
          'posts:0',
          'users:0',
          'roles:0',
          'profiles:2',
          'settings:2',
          'payment:0',
          'activity-logs:0',
          'structured-data:0',
          'blocks:0',
          'comments:0',
          'tags:0',
          'widgets:0',
          'seo:0'
        ],
      },
      {
        name: 'Guest',
        description: 'Guest role with read-only access to admin panel.',
        permissions: [
          'profiles:2',
          'settings:2'
        ],
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        await this.roleService.create(roleData);
        this.logger.log(`Role "${roleData.name}" created with permissions: ${roleData.permissions.join(', ')}`);
      } else {
        // Optionally update permissions if the existing role doesn't match
        const currentPermissions = existingRole.permissions.sort().join(',');
        const newPermissions = roleData.permissions.sort().join(',');

        if (currentPermissions !== newPermissions) {
          await this.roleService.update(existingRole.id, { permissions: roleData.permissions });
          this.logger.log(`Role "${roleData.name}" updated with new permissions: ${roleData.permissions.join(', ')}`);
        } else {
          this.logger.log(`Role "${roleData.name}" already exists with correct permissions.`);
        }
      }
    }
  }
}
