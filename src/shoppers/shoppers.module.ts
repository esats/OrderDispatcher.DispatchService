import { Module } from '@nestjs/common';
import { ShoppersService } from './shoppers.service';

@Module({
  providers: [ShoppersService],
  exports: [ShoppersService],
})
export class ShoppersModule {}
