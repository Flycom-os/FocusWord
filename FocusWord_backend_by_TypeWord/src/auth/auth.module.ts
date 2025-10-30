import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getJWTConfig } from '../configs/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ModulesModule } from '../modules/modules.module';
import { AuthInit } from './auth.init';
import emailConfig from './config/email.config';
//module and dependencies initialization in nest js project
@Module({
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, AuthInit],
  controllers: [AuthController],
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
    ConfigModule.forRoot({
      load: [emailConfig], // Загрузка конфигурации электронной почты
    }),
    ModulesModule,
    UsersModule,
  ],
  exports: [],
})
export class AuthModule {}
