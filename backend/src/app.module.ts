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
import { SimpleSettingsModule } from "./app/settings/simple-settings.module";
import { PrismaModule } from "./prisma/prisma.module";
import { RecordsModule } from "./app/records/records.module";
import { CategoriesModule } from "./app/categories/categories.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'backend/.env', '../.env'],
    }),
    RedisModule,
    AuthModule,
    UserModule,
    RoleModule,
    PagesModule,
    MediafilesModule,
    SlidersModule,
    SimpleSettingsModule,
    PrismaModule,
    RecordsModule,
    CategoriesModule
  ],
  controllers: [AppController],
  providers: [PrismaService, AppService],
})
export class AppModule {}

