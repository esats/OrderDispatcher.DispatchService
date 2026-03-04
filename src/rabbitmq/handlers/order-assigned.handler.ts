import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../../orders/orders.service';

@Injectable()
export class OrderAssignedHandler {
  private readonly logger = new Logger(OrderAssignedHandler.name);

  constructor(private readonly ordersService: OrdersService) {}

  async handle(orderId: string): Promise<void> {
    this.logger.log(`Handling order.assigned: ${orderId}`);
    await this.ordersService.handleOrderAssigned(orderId);
  }
}
