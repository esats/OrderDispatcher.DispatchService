import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.provider';
import { REDIS_KEYS } from '../../shared/constants';

@Injectable()
export class IdempotencyStore {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {}

  async tryMarkProcessed(orderId: string): Promise<boolean> {
    const key = `${REDIS_KEYS.PROCESSED_ORDER}${orderId}`;
    const ttl = this.config.get<number>('ttl.idempotency')!;
    const result = await this.redis.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }
}
