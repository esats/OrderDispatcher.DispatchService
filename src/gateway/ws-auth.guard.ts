import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Socket } from 'socket.io';

@Injectable()
export class WsAuthGuard {
  private readonly logger = new Logger(WsAuthGuard.name);

  constructor(private readonly config: ConfigService) {}

  validate(client: Socket): boolean {
    const token =
      client.handshake.auth?.token ||
      (client.handshake.headers?.authorization as string)?.replace(
        'Bearer ',
        '',
      );

    if (!token) {
      this.logger.warn('WS connection rejected: no token');
      return false;
    }

    // Placeholder: accept any non-empty token
    // TODO: verify JWT signature with this.config.get('jwt.secret')

    const shopperId = client.handshake.query?.shopperId as string;
    if (!shopperId) {
      this.logger.warn('WS connection rejected: no shopperId');
      return false;
    }

    client.data = { shopperId };
    return true;
  }
}
