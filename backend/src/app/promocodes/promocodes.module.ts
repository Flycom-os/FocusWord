
import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { PromocodesController} from "./promocodes/promocodes.controller";
import { ForKeyService } from "./promocodes/promocodes_service";


@Module({
  imports: [JwtModule.register({})],
  controllers: [PromocodesController],
  providers:[ForKeyService, PrismaService],
  exports: [ForKeyService]
})
export class PromocodesModule {}