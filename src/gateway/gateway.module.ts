import { Module } from '@nestjs/common';
import { DispatchGateway } from './dispatch.gateway';
import { WsAuthGuard } from './ws-auth.guard';
import { ShoppersModule } from '../shoppers/shoppers.module';

@Module({
  imports: [ShoppersModule],
  providers: [DispatchGateway, WsAuthGuard],
  exports: [DispatchGateway],
})
export class GatewayModule {}
