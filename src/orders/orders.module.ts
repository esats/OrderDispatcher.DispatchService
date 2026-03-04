import { Module } from '@nestjs/common';
import { GatewayModule } from '../gateway/gateway.module';
import { ShoppersModule } from '../shoppers/shoppers.module';
import { HealthController, OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { AvailableOrdersStore } from './store/available-orders.store';
import { IdempotencyStore } from './store/idempotency.store';

@Module({
  imports: [ShoppersModule, GatewayModule],
  controllers: [OrdersController, HealthController],
  providers: [OrdersService, AvailableOrdersStore, IdempotencyStore],
  exports: [OrdersService],
})
export class OrdersModule {}
