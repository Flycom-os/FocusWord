import { CacheModule } from '@nestjs/cache-manager';
import { Module, Global, Logger } from '@nestjs/common';
import { redisStore } from 'cache-manager-redis-yet';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis'; // Import IORedis

export const REDIS_CLIENT = 'REDIS_CLIENT'; // Token for our custom provider

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = parseInt(
          configService.get<string>('REDIS_PORT') || '6380',
          10,
        );
        const ttl = configService.get<number>('CACHE_TTL') || 3600;

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
          logger.error('Failed to connect to CacheManager Redis or create store.', error.stack);
          throw new Error('Could not establish CacheManager Redis connection.');
        }
      },
    }),
  ],
  providers: [ // Add our custom Redis client provider
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = parseInt(
          configService.get<string>('REDIS_PORT') || '6380',
          10,
        );
        logger.log(`Attempting to connect to direct IORedis client at host: ${host}, port: ${port}`);
        const client = new IORedis({ host, port });

        client.on('error', (err) => {
          logger.error('IORedis Client Error:', err);
        });
        client.on('connect', () => {
          logger.log('IORedis Client Connected Successfully!');
        });
        
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [CacheModule, REDIS_CLIENT], // Export both CacheModule and our custom Redis client
})
export class RedisModule {}

