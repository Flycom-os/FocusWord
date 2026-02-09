import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from "../prisma/prisma.service";
import {AuthModule} from './user/auth/auth.module'
import { AppService } from "./app.service";
import { UserModule } from "./app/user/user.module";
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';

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
    // CartModule,
    // OrdersModule,
    // AddressModule
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}
