import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.provider';
import { REDIS_KEYS } from '../../shared/constants';
import { AvailableOrder } from '../../shared/types/order-message.type';

@Injectable()
export class AvailableOrdersStore {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly config: ConfigService,
  ) {}

  async add(order: AvailableOrder): Promise<void> {
    const key = `${REDIS_KEYS.AVAILABLE_ORDER}${order.orderId}`;
    const ttl = this.config.get<number>('ttl.availableOrder')!;
    const score = new Date(order.receivedAtUtc).getTime();

    const pipeline = this.redis.multi();
    pipeline.set(key, JSON.stringify(order), 'EX', ttl);
    pipeline.zadd(REDIS_KEYS.AVAILABLE_ORDERS_ZSET, score.toString(), order.orderId);
    await pipeline.exec();
  }

  async remove(orderId: string): Promise<void> {
    const key = `${REDIS_KEYS.AVAILABLE_ORDER}${orderId}`;
    const pipeline = this.redis.multi();
    pipeline.del(key);
    pipeline.zrem(REDIS_KEYS.AVAILABLE_ORDERS_ZSET, orderId);
    await pipeline.exec();
  }

  async get(orderId: string): Promise<AvailableOrder | null> {
    const raw = await this.redis.get(
      `${REDIS_KEYS.AVAILABLE_ORDER}${orderId}`,
    );
    return raw ? (JSON.parse(raw) as AvailableOrder) : null;
  }

  async getAll(): Promise<AvailableOrder[]> {
    const memberIds = await this.redis.zrange(
      REDIS_KEYS.AVAILABLE_ORDERS_ZSET,
      0,
      -1,
    );

    if (memberIds.length === 0) return [];

    const pipeline = this.redis.pipeline();
    for (const id of memberIds) {
      pipeline.get(`${REDIS_KEYS.AVAILABLE_ORDER}${id}`);
    }
    const results = await pipeline.exec();
    if (!results) return [];

    const orders: AvailableOrder[] = [];
    const staleIds: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const [err, raw] = results[i];
      if (err || !raw) {
        staleIds.push(memberIds[i]);
        continue;
      }
      orders.push(JSON.parse(raw as string) as AvailableOrder);
    }

    // Clean up stale ZSET entries from expired keys
    if (staleIds.length > 0) {
      await this.redis.zrem(REDIS_KEYS.AVAILABLE_ORDERS_ZSET, ...staleIds);
    }

    return orders;
  }

  async tryLock(orderId: string): Promise<boolean> {
    const key = `${REDIS_KEYS.ORDER_LOCK}${orderId}`;
    const ttl = this.config.get<number>('ttl.orderLock')!;
    const result = await this.redis.set(key, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }
}
