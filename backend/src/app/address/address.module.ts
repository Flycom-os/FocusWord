import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PrismaService } from "../../../prisma/prisma.service";
import { AddressController } from "./address.controller";
import { AddressService } from "./address.service";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AddressController],
  providers: [AddressService, PrismaService],
  exports: [AddressService]
})
export class AddressModule {}
