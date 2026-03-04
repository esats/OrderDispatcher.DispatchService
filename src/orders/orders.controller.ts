import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { AcceptOrderDto } from './dto/accept-order.dto';
import { AcceptOrderResponseDto } from './dto/accept-order-response.dto';
import { OrdersService } from './orders.service';

@Controller('api/dispatch')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('accept')
  async acceptOrder(
    @Body() dto: AcceptOrderDto,
    @Req() req: Request,
  ): Promise<AcceptOrderResponseDto> {
    // Placeholder: extract shopperId from header until JWT middleware is wired
    const shopperId = req.headers['x-shopper-id'] as string;

    const result = await this.ordersService.acceptOrder(dto.orderId, shopperId);

    if (!result.success) {
      throw new ConflictException('Order is no longer available');
    }

    return { success: true, message: 'Order assigned successfully' };
  }

  @Get('available')
  async getAvailableOrders() {
    return this.ordersService.getAvailableOrders();
  }
}

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
