import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from "../prisma/prisma.service";
import {AuthModule} from './user/auth/auth.module'
import { AppService } from "./app.service";
import { UserModule } from "./app/user/user.module";
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { RoleModule } from './app/role/role.module';
import { PagesModule } from "./app/pages/pages.module";
import { MediafilesModule } from "./app/mediafiles/mediafiles.module";
import { SlidersModule } from "./app/sliders/sliders.module"; // Import RoleModule

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available everywhere
    }),
    RedisModule,
    AuthModule,
    // PromocodesModule,
    // FlowersModule,
    // ShopsModule,
    // ProductModule,
    UserModule,
    RoleModule, // Add RoleModule here
    PagesModule, // Add PagesModule here
    MediafilesModule, // Add MediafilesModule here
    SlidersModule, // Add SlidersModule here
    // CartModule,
    // OrdersModule,
    // AddressModule
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}

