import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Требуется access_token');
    }

    const token = authHeader.split(' ')[1];

    try {
      const user = this.jwtService.verify(token, { secret: process.env.JWT_SECRET || 'kkll' });
      (request as any).user = user as any;
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
