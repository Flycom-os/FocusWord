import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { UserController} from "./user/user.controller";
import { UserService } from "./user/user_service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [UserController],
  providers:[UserService, PrismaService],
  exports: [UserService]
})
export class UserModule {}