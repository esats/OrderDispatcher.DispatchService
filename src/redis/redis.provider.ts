import { Provider, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (config: ConfigService): Redis => {
    const logger = new Logger('RedisProvider');

    const client = new Redis({
      host: config.get<string>('redis.host'),
      port: config.get<number>('redis.port'),
      password: config.get<string>('redis.password'),
      lazyConnect: false,
    });

    client.on('connect', () => logger.log('Connected to Redis'));
    client.on('error', (err) => logger.error('Redis error', err.message));

    return client;
  },
  inject: [ConfigService],
};
