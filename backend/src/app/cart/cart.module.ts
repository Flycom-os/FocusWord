import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../../../prisma/prisma.service";
import { CartController } from "./cart.controller";
import { CartService } from "./cart.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [CartController],
  providers: [CartService, PrismaService],
  exports: [CartService]
})
export class CartModule {}
