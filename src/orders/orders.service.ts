import { Injectable, Logger } from '@nestjs/common';
import { DispatchGateway } from '../gateway/dispatch.gateway';
import { ShoppersService } from '../shoppers/shoppers.service';
import { AvailableOrder } from '../shared/types/order-message.type';
import { AvailableOrdersStore } from './store/available-orders.store';
import { IdempotencyStore } from './store/idempotency.store';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly availableOrders: AvailableOrdersStore,
    private readonly idempotency: IdempotencyStore,
    private readonly shoppersService: ShoppersService,
    private readonly dispatchGateway: DispatchGateway,
  ) {}

  async handleOrderCreated(orderId: string): Promise<void> {
    const isNew = await this.idempotency.tryMarkProcessed(orderId);
    if (!isNew) {
      this.logger.warn(`Duplicate order.created ignored: ${orderId}`);
      return;
    }

    const order: AvailableOrder = {
      orderId,
      receivedAtUtc: new Date().toISOString(),
    };
    await this.availableOrders.add(order);

    const shopperIds = await this.shoppersService.getActiveShopperIds();

    this.dispatchGateway.broadcastOrderNew(shopperIds, { orderId });

    this.logger.log(
      `Order ${orderId} available, notified ${shopperIds.length} shoppers`,
    );
  }

  async handleOrderCancelled(orderId: string): Promise<void> {
    await this.availableOrders.remove(orderId);

    const shopperIds = await this.shoppersService.getActiveShopperIds();
    this.dispatchGateway.broadcastOrderClosed(shopperIds, {
      orderId,
      reason: 'cancelled',
    });

    this.logger.log(`Order ${orderId} cancelled and removed`);
  }

  async handleOrderAssigned(orderId: string): Promise<void> {
    await this.availableOrders.remove(orderId);

    const shopperIds = await this.shoppersService.getActiveShopperIds();
    this.dispatchGateway.broadcastOrderClosed(shopperIds, {
      orderId,
      reason: 'assigned',
    });

    this.logger.log(`Order ${orderId} assigned and removed`);
  }

  async acceptOrder(
    orderId: string,
    shopperId: string,
  ): Promise<{ success: boolean }> {
    const order = await this.availableOrders.get(orderId);
    if (!order) {
      return { success: false };
    }

    const locked = await this.availableOrders.tryLock(orderId);
    if (!locked) {
      return { success: false };
    }

    await this.availableOrders.remove(orderId);

    const shopperIds = await this.shoppersService.getActiveShopperIds();
    this.dispatchGateway.broadcastOrderClosed(shopperIds, {
      orderId,
      reason: 'assigned',
    });

    this.logger.log(`Order ${orderId} accepted by shopper ${shopperId}`);
    return { success: true };
  }

  async getAvailableOrders(): Promise<AvailableOrder[]> {
    return this.availableOrders.getAll();
  }
}
