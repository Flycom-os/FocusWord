import { CacheModule } from '@nestjs/cache-manager';
import { Module, Global } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST') || 'localhost',
        port: configService.get<number>('REDIS_PORT') || 6379,
        ttl: configService.get<number>('CACHE_TTL') || 3600, // seconds
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule {}
