import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { OrderAssignedHandler } from './handlers/order-assigned.handler';
import { OrderCancelledHandler } from './handlers/order-cancelled.handler';
import { OrderCreatedHandler } from './handlers/order-created.handler';
import { RabbitmqService } from './rabbitmq.service';

@Module({
  imports: [OrdersModule],
  providers: [RabbitmqService, OrderCreatedHandler, OrderCancelledHandler, OrderAssignedHandler],
})
export class RabbitmqModule {}
