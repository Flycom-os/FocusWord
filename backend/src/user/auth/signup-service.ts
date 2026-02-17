import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { PrismaService } from '../../../prisma/prisma.service';
import { RegisterDto } from '../../dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(dto: RegisterDto) {
    // 1. Check if any roles exist in the database
    const roleCount = await this.prisma.role.count();

    let assignedRole: Role | null = null;

    if (roleCount === 0) {
      // First registration: Create Admin role if it doesn't exist, and assign it
      let adminRole = await this.prisma.role.findUnique({ where: { name: 'Admin' } });
      if (!adminRole) {
        adminRole = await this.prisma.role.create({
          data: {
            name: 'Admin',
            // Comprehensive Admin permissions (level 2 for various resources)
            permissions: [
              'users:2', 'roles:2', 'news:2', 'comments:2', 'history:2',
              'process:2', 'ballons:2', 'tectechnical_gasses:2',
              // Add other resources as needed with appropriate level
            ],
          },
        });
      }
      assignedRole = adminRole;
    } else {
      // Subsequent registrations: Determine role based on dto.permission or default to Guest
      let targetRoleName: string;
      let targetPermissions: string[];

      const permissionLevel = dto.permission; // Use the permission from DTO

      if (permissionLevel === 0 || permissionLevel === 1 || permissionLevel === 2) {
        targetRoleName = `UserLevel${permissionLevel}`;
        switch (permissionLevel) {
          case 0:
            targetPermissions = ['users:0', 'news:0', 'comments:0']; // Read-only
            break;
          case 1:
            targetPermissions = ['users:1', 'news:1', 'comments:1']; // Read, Create, Update
            break;
          case 2:
            targetPermissions = ['users:2', 'news:2', 'comments:2']; // Read, Create, Delete
            break;
          default:
            // This case should ideally not be reached due to the outer if
            targetRoleName = 'Guest';
            targetPermissions = ['users:0', 'news:0', 'comments:0'];
            break;
        }
      } else {
        // If no valid permission is provided or it's outside 0-2 range, default to Guest
        targetRoleName = 'Guest';
        targetPermissions = ['users:0', 'news:0', 'comments:0'];
      }

      let role = await this.prisma.role.findUnique({ where: { name: targetRoleName } });
      if (!role) {
        role = await this.prisma.role.create({
          data: {
            name: targetRoleName,
            permissions: targetPermissions,
          },
        });
      }
      assignedRole = role;
    }

    // Ensure a role was successfully assigned or retrieved
    if (!assignedRole) {
      throw new InternalServerErrorException('Could not determine role for user registration.');
    }

    // Check if user already exists
    const userExists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new BadRequestException('Email is already in use');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.name,    // Using dto.name as firstName
        lastName: dto.surname,  // Using dto.surname as lastName
        roleId: assignedRole.id, // Assign the determined role
      },
      include: { role: true }, // Include role information in the returned user object
    });

    // Generate tokens
    const access_token_payload = {
      id: user.id,
      email: user.email,
      role: user.role, // Include the full role object
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.email, // Assuming email as username for now
    };

    const access_token = this.jwtService.sign(access_token_payload, { expiresIn: '15h' });
    const refresh_token = this.jwtService.sign(access_token_payload, { expiresIn: '15d' });

    return { message: 'Registration success', user: user, access_token: access_token, refreash_token: refresh_token };
  }

  async signIn(identifer:string, password:string) {
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: identifer }] },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('password is incorrect');
    }

    // Ensure user.role is not null before accessing its properties
    const userRole = user.role ? {
      id: user.role.id,
      name: user.role.name,
      permissions: user.role.permissions,
    } : undefined;

    const access_token_payload = {
      id: user.id,
      email: user.email,
      role: userRole, // Include the full role object or undefined
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
    };

    const access_token = this.jwtService.sign(access_token_payload, { expiresIn: '15h' });
    const refreash_token = this.jwtService.sign(access_token_payload, { expiresIn: '15d' });

    return { message: 'Authorization success', user: user, access_token: access_token, refreash_token: refreash_token };
  }
}