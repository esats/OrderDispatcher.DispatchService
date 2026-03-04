import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { GatewayModule } from './gateway/gateway.module';
import { OrdersModule } from './orders/orders.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';
import { ShoppersModule } from './shoppers/shoppers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    RedisModule,
    ShoppersModule,
    GatewayModule,
    OrdersModule,
    RabbitmqModule,
  ],
})
export class AppModule {}
