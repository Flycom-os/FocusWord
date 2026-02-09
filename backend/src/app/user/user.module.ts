import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { UserController} from "./user/user.controller";
import { UserService } from "./user/user_service";
import { Reflector } from "@nestjs/core"; // Import Reflector
import { AuthModule } from "../../user/auth/auth.module"; // Import AuthModule

@Module({
  imports: [AuthModule], // Import AuthModule
  controllers: [UserController],
  providers:[UserService, PrismaService, Reflector], // Add Reflector to providers
  exports: [UserService]
})
export class UserModule {}