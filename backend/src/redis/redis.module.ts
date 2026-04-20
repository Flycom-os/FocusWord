import { CacheModule } from '@nestjs/cache-manager';
import { Module, Global, Logger } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis'; // Import IORedis

export const REDIS_CLIENT = 'REDIS_CLIENT'; // Token for our custom provider

const createNoopRedisClient = () => ({
  get: async (_key: string) => null,
  set: async (_key: string, _value: string) => 'OK',
  del: async (_keys: string | string[]) => 0,
  keys: async (_pattern: string) => [] as string[],
  on: () => undefined,
  quit: async () => undefined,
});

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const redisEnabled = (configService.get<string>('REDIS_ENABLED') || 'true').toLowerCase() === 'true';
        const host = configService.get<string>('REDIS_HOST') || '127.0.0.1';
        const port = parseInt(
          configService.get<string>('REDIS_PORT') || '6379',
          10,
        );
        const ttl = configService.get<number>('CACHE_TTL') || 3600;

        if (!redisEnabled) {
          logger.warn('Redis disabled by REDIS_ENABLED=false. Using in-memory cache.');
          return { ttl };
        }

        logger.log(`Attempting to connect to CacheManager Redis at host: ${host}, port: ${port}, ttl: ${ttl}`);

        try {
          const store = await redisStore({
            socket: {
              host,
              port,
            },
            ttl,
          });
          logger.log('Successfully connected to CacheManager Redis and created store.');
          logger.log('Returning CacheManager store object:', store);
          return {
            store: store,
          };
        } catch (error) {
          logger.error('Failed to connect to CacheManager Redis. Falling back to in-memory cache.', error?.stack);
          return { ttl };
        }
      },
    }),
  ],
  providers: [ // Add our custom Redis client provider
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const redisEnabled = (configService.get<string>('REDIS_ENABLED') || 'true').toLowerCase() === 'true';
        const host = configService.get<string>('REDIS_HOST') || '127.0.0.1';
        const port = parseInt(
          configService.get<string>('REDIS_PORT') || '6379',
          10,
        );

        if (!redisEnabled) {
          logger.warn('Redis client disabled by REDIS_ENABLED=false. Using noop Redis client.');
          return createNoopRedisClient();
        }

        logger.log(`Attempting to connect to direct IORedis client at host: ${host}, port: ${port}`);
        const client = new IORedis({
          host,
          port,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 1500,
        });

        client.on('error', (err) => {
          logger.error('IORedis Client Error:', err);
        });
        client.on('connect', () => {
          logger.log('IORedis Client Connected Successfully!');
        });

        try {
          await client.connect();
          await client.ping();
          return client;
        } catch (error) {
          logger.error('Failed to connect direct IORedis client. Using noop Redis client.', error?.stack);
          try {
            client.disconnect();
          } catch {
            // noop
          }
          return createNoopRedisClient();
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheModule, REDIS_CLIENT], // Export both CacheModule and our custom Redis client
})
export class RedisModule {}

