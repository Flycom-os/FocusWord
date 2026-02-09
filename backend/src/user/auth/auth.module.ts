import { Module } from '@nestjs/common';
import { AuthService } from './signup-service';
import { AuthController, } from "./auth.controller";
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports:[
    JwtModule.register({
      secret: process.env.JWT_SECRET || "kkll",
      signOptions: {expiresIn: '15m'},
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
