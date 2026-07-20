import { PrismaService } from '../../../../prisma/prisma.service';
import { AuthService } from '../signup-service';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService = Login', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: { findFirst: jest.fn() },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mocked-token'),
          },
        },
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });
  it('✅ Should authenticate user by email', async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      id: 12,
      email: 'newuuser@example.com',
      password: await bcrypt.hash('mypassword', 10),
    });

    const result = await authService.signIn(
      'newuuser@example.com',
      'mypassword',
    );

    expect(result).toHaveProperty('access_token');
    // expect(result).toHaveProperty('refresh_token');
  });

  it('❌ Should throw an error if user not found', async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValue(null);

    await expect(
      authService.signIn('notfound@example.com', 'mypassword'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('❌ Should throw an error if password is incorrect', async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: await bcrypt.hash('mypassword', 10),
    });

    await expect(
      authService.signIn('test@example.com', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });
});
