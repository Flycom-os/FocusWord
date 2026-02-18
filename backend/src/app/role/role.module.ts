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
        description: 'Administrator role with full access to mediafiles, pages, and sliders.',
        permissions: [
          'mediafiles:2', // Full access
          'pages:2',      // Full access
          'sliders:2',    // Full access
          'roles:2',      // Full access
          'users:2',      // Full access
        ],
      },
      {
        name: 'Guest',
        description: 'Guest role with read-only access to mediafiles, pages, and sliders.',
        permissions: [
          'mediafiles:0', // Read-only
          'pages:0',      // Read-only
          'sliders:0',    // Read-only
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
