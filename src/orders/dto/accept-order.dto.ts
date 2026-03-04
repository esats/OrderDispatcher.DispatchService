import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptOrderDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;
}
