import { Module } from '@nestjs/common';
import { DispatchGateway } from './dispatch.gateway';
import { WsAuthGuard } from './ws-auth.guard';

@Module({
  providers: [DispatchGateway, WsAuthGuard],
  exports: [DispatchGateway],
})
export class GatewayModule {}
