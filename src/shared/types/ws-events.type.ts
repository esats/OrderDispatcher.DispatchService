export interface OrderNewPayload {
  orderId: string;
}

export interface OrderClosedPayload {
  orderId: string;
  reason: 'assigned' | 'cancelled';
}
