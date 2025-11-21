import { TechnicalGasBalloonController } from "./flowers/flowers.controller";
import { Module } from "@nestjs/common";
import { GasBallonsService } from "./flowers/flowers_service";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule.register({})],
  controllers: [TechnicalGasBalloonController],
  providers:[GasBallonsService, PrismaService],
  exports: [GasBallonsService]
})
export class FlowersModule {}