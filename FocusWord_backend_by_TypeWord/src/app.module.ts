import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { MiniatureModel } from './files/miniature.model';
import { FilesModel } from './files/files.model';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.model';
import { Role } from './roles/role.model';
import { RoleRoles } from './roles/role-roles.model';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import * as process from 'process';
import { ModulesModule } from './modules/modules.module';
import { SeoModule } from './seo/seo.module';
import { PostsModule } from './posts/posts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PagesModule } from './pages/pages.module';
import { TemplatesModule } from './templates/templates.module';
import { SlidersModule } from './sliders/sliders.module';
import { SliderCategoryModel } from './sliders/model/sliderCategory.model';
import { SliderGroupModel } from './sliders/model/sliderGroup.model';
import { SliderModel } from './sliders/model/slide.model';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

@Module({
  controllers: [],
  providers: [],
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [User, Role, RoleRoles, FilesModel, MiniatureModel, SliderCategoryModel, SliderGroupModel, SliderModel],
      autoLoadModels: true,
      dialectOptions: {
        useUTC: false,
      },
      timezone: '+06:00',
      logging: false,
    }),
    CacheModule.registerAsync({
      useFactory: async () => ({
        store: await redisStore({
          url: process.env.REDIS_URL,
          password: process.env.REDIS_PASS,
        }),
      }),
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve('staticdata'),
      serveRoot: '/staticdata',
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    RolesModule,
    ModulesModule,
    FilesModule,
    SeoModule,
    PostsModule,
    PagesModule,
    TemplatesModule,
    SlidersModule,
  ],
})
export class AppModule {}
