import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from './user/auth/auth.module';
import { AppService } from './app.service';
import { UserModule } from './app/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { RoleModule } from './app/role/role.module';
import { PagesModule } from './app/pages/pages.module';
import { BlogModule } from './app/blog/blog.module';
import { ArticlesModule } from './app/articles/articles.module';
import { MediafilesModule } from './app/mediafiles/mediafiles.module';
import { SlidersModule } from './app/sliders/sliders.module';
import { SettingsModule } from './app/settings/settings.module';
import { PrismaModule } from './prisma/prisma.module';
import { RecordsModule } from './app/records/records.module';
import { CategoriesModule } from './app/categories/categories.module';
import { WidgetsModule } from './app/widgets/widgets.module';
import { CommentModule } from './app/comments/comment.module';
import { SeoModule } from './app/seo/seo.module';
import { ActivityLogsModule } from './app/activity-logs/activity-logs.module';
import { AnalyticsModule } from './app/analytics/analytics.module';
import { TagsModule } from './app/tags/tags.module';
import { FeedbackModule } from './app/feedback/feedback.module';
import { DatabaseModule } from './app/database/database.module';
import { PaymentsModule } from './app/payments/payments.module';
import { MailerModule } from './app/mailer/mailer.module';
import { ProductsModule } from './app/products/products.module';
import { ProductCategoriesModule } from './app/product-categories/product-categories.module';
import { EmailProviderModule } from './app/email-providers/email-provider.module';
import { EmailTemplatesModule } from './app/email-templates/email-template.module';
import { DomainManagementModule } from './app/domain-management/domain.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogInterceptor } from './common/interceptors/activity-log.interceptor';
import { CommonServicesModule } from './common/common-services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', 'backend/.env', '../.env'],
    }),
    CommonServicesModule,
    RedisModule,
    AuthModule,
    UserModule,
    RoleModule,
    PagesModule,
    BlogModule,
    ArticlesModule,
    MediafilesModule,
    SlidersModule,
    SettingsModule,
    PrismaModule,
    RecordsModule,
    CategoriesModule,
    WidgetsModule,
    CommentModule,
    SeoModule,
    ActivityLogsModule,
    AnalyticsModule,
    TagsModule,
    FeedbackModule,
    DatabaseModule,
    PaymentsModule,
    // Mailer module provides email sending capabilities
    MailerModule,
    EmailProviderModule,
    EmailTemplatesModule,
    DomainManagementModule,
    ProductsModule,
    ProductCategoriesModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ActivityLogInterceptor,
    },
  ],
})
export class AppModule {}
