import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { ROUTING_KEYS } from '../shared/constants';
import { OrderAssignedHandler } from './handlers/order-assigned.handler';
import { OrderCancelledHandler } from './handlers/order-cancelled.handler';
import { OrderCreatedHandler } from './handlers/order-created.handler';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection?: amqp.ChannelModel;
  private channel?: amqp.Channel;

  constructor(
    private readonly config: ConfigService,
    private readonly orderCreatedHandler: OrderCreatedHandler,
    private readonly orderCancelledHandler: OrderCancelledHandler,
    private readonly orderAssignedHandler: OrderAssignedHandler,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('rabbitmq.url')!;
    const exchange = this.config.get<string>('rabbitmq.exchange')!;
    const queue = this.config.get<string>('rabbitmq.queue')!;
    const prefetch = this.config.get<number>('rabbitmq.prefetch')!;

    try {
      const connection = await amqp.connect(url);
      this.connection = connection;
      const channel = await connection.createChannel();
      this.channel = channel;
      await channel.prefetch(prefetch);

      await channel.assertExchange(exchange, 'topic', { durable: true });
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, ROUTING_KEYS.ORDER_CREATED);
      await channel.bindQueue(
        queue,
        exchange,
        ROUTING_KEYS.ORDER_CANCELLED,
      );
      await channel.bindQueue(
        queue,
        exchange,
        ROUTING_KEYS.ORDER_ASSIGNED,
      );

      await channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;
          try {
            const routingKey = msg.fields.routingKey;
            const orderId = msg.content.toString();

            if (routingKey === ROUTING_KEYS.ORDER_CREATED) {
              await this.orderCreatedHandler.handle(orderId);
            } else if (routingKey === ROUTING_KEYS.ORDER_CANCELLED) {
              await this.orderCancelledHandler.handle(orderId);
            } else if (routingKey === ROUTING_KEYS.ORDER_ASSIGNED) {
              await this.orderAssignedHandler.handle(orderId);
            } else {
              this.logger.warn(`Unknown routing key: ${routingKey}`);
            }

            channel.ack(msg);
          } catch (error) {
            this.logger.error('Failed to process message', (error as Error).stack);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false },
      );

      this.logger.log(
        `Consuming from queue "${queue}" bound to exchange "${exchange}"`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to connect to RabbitMQ',
        (error as Error).stack,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
      await this.connection?.close();
      this.logger.log('RabbitMQ connection closed');
    } catch (error) {
      this.logger.error(
        'Error closing RabbitMQ connection',
        (error as Error).message,
      );
    }
  }
}
