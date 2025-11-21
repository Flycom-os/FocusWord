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
      providers: [AuthService,
        {
          provide: PrismaService,
          useValue:{
            user:{findFirst: jest.fn()},
          }
        },{
        provide: JwtService,
          useValue:{
          sign:jest.fn().mockReturnValue('mocked-token')
          }
        }],
    }).compile();
    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });
  it('✅ Должен авторизовать пользователя по email', async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      id: 12,
      email: 'newuuser@example.com',
      phone: '+1244567890',
      password: await bcrypt.hash('mypassword', 10),
    });

    const result = await authService.signIn('newuuser@example.com', 'mypassword');

    expect(result).toHaveProperty('access_token');
    // expect(result).toHaveProperty('refresh_token');
  });

  it('❌ Должен выдать ошибку, если пользователь не найден', async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValue(null);

    await expect(
      authService.signIn('notfound@example.com', 'mypassword'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('❌ Должен выдать ошибку, если пароль неверный', async () => {
    prisma.user.findFirst = jest.fn().mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      phone: '+1234567890',
      password: await bcrypt.hash('mypassword', 10),
    });

    await expect(authService.signIn('test@example.com', 'wrongpassword')).rejects.toThrow(
      UnauthorizedException,
    );
  });
})