import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../redis/redis.provider';
import { REDIS_KEYS } from '../shared/constants';

@Injectable()
export class ShoppersService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async getActiveShopperIds(): Promise<string[]> {
    return this.redis.smembers(REDIS_KEYS.ACTIVE_SHOPPERS);
  }
}
