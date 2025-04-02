import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { UnauthorizedExceptionResponse } from '../responses/auth.unauthorized.responses';
import { Role } from '../../roles/role.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtStrategy.extractJWT]),
      secretOrKey: configService.get('JWT_ACCESS_KEY'),
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'access_token' in req.cookies) {
      return req.cookies['access_token'];
    }
    return null;
  }

  async validate(payload: any): Promise<{
    id: number;
    name: string;
    email: string;
    superuser: boolean;
    role: Role;
  }> {
    if (payload === null) {
      throw new UnauthorizedExceptionResponse();
    }
    return {
      id: payload.payload.id,
      name: payload.payload.name,
      email: payload.payload.email,
      superuser: payload.payload.superuser,
      role: payload.payload.role,
    };
  }
}
