
import { Module } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { JwtModule } from "@nestjs/jwt";
import { OffersService } from "./shops/shops_service";
import { ShopsController} from "./shops/shops.controller";
import {ShopoCommenntService} from "./shops_comment/shops_service";
import {ShopsCommentController} from "./shops_comment/shops.controller";


@Module({
  imports: [JwtModule.register({})],
  controllers: [ShopsController, ShopsCommentController ],
  providers:[OffersService, PrismaService, ShopoCommenntService],
  exports: [OffersService, ShopoCommenntService]
})
export class ShopsModule {}