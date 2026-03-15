import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RequestWithUser } from './common/interfaces/request-with-user.interface';
import { IS_PUBLIC_KEY } from './common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Требуется access_token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'kkll' });
      (request as RequestWithUser).user = user;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Токен истек, выполните повторный вход');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Некорректный токен');
      }
      throw new UnauthorizedException('Неверный access_token');
    }
  }
}
