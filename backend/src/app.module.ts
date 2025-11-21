import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from "../prisma/prisma.service";
import {AuthModule} from './user/auth/auth.module'
import { AppService } from "./app.service";
import {PromocodesModule} from "./app/promocodes/promocodes.module";
import {FlowersModule} from "./app/flowers/flowers.module";
import {ShopsModule} from "./app/shops/shops.module";
import {ProductModule} from "./app/product/product.module";
import { UserModule } from "./app/user/user.module";
import { CartModule } from "./app/cart/cart.module";
import { OrdersModule } from "./app/orders/orders.module";
import { AddressModule } from "./app/address/address.module";

@Module({
  imports: [
    AuthModule,
    PromocodesModule,
    FlowersModule,
    ShopsModule,
    ProductModule,
    UserModule,
    CartModule,
    OrdersModule,
    AddressModule
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
