import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class OrderCreatedHandler {
  private readonly logger = new Logger(OrderCreatedHandler.name);

  constructor(private readonly ordersService: OrdersService) {}

  async handle(orderId: string): Promise<void> {
    this.logger.log(`Handling order.created: ${orderId}`);
    await this.ordersService.handleOrderCreated(orderId);
  }
}
