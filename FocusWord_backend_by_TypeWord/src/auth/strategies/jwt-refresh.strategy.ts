import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedExceptionResponse } from '../responses/auth.unauthorized.responses';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([JwtRefreshStrategy.extractJWT]),
      secretOrKey: configService.get('JWT_REFRESH_KEY'),
    });
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && 'refresh_token' in req.cookies) {
      return req.cookies[`refresh_token`];
    }
    return null;
  }

  async validate(payload: any): Promise<{ id: number }> {
    if (payload === null) {
      throw new UnauthorizedExceptionResponse();
    }
    return { id: payload.payload.id };
  }
}
