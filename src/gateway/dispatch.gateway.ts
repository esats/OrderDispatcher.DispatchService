import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WS_EVENTS } from '../shared/constants';
import { OrderClosedPayload, OrderNewPayload } from '../shared/types/ws-events.type';
import { WsAuthGuard } from './ws-auth.guard';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/dispatch',
})
export class DispatchGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(DispatchGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly wsAuth: WsAuthGuard) {}

  handleConnection(client: Socket): void {
    const valid = this.wsAuth.validate(client);
    if (!valid) {
      client.disconnect(true);
      return;
    }

    const shopperId = client.data.shopperId as string;
    const room = `shopper:${shopperId}`;
    client.join(room);
    this.logger.log(`Shopper ${shopperId} connected, joined room ${room}`);
  }

  handleDisconnect(client: Socket): void {
    const shopperId = (client.data?.shopperId as string) ?? 'unknown';
    this.logger.log(`Shopper ${shopperId} disconnected`);
  }

  broadcastOrderNew(shopperIds: string[], payload: OrderNewPayload): void {
    for (const id of shopperIds) {
      this.server.to(`shopper:${id}`).emit(WS_EVENTS.ORDER_NEW, payload);
    }
  }

  broadcastOrderClosed(
    shopperIds: string[],
    payload: OrderClosedPayload,
  ): void {
    for (const id of shopperIds) {
      this.server.to(`shopper:${id}`).emit(WS_EVENTS.ORDER_CLOSED, payload);
    }
  }
}
