import { Module } from '@nestjs/common';
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
export class RoleModule {}
