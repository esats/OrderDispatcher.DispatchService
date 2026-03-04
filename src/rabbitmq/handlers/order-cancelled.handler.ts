import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class OrderCancelledHandler {
  private readonly logger = new Logger(OrderCancelledHandler.name);

  constructor(private readonly ordersService: OrdersService) {}

  async handle(orderId: string): Promise<void> {
    this.logger.log(`Handling order.cancelled: ${orderId}`);
    await this.ordersService.handleOrderCancelled(orderId);
  }
}
