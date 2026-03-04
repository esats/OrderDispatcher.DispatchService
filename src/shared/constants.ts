export const REDIS_KEYS = {
  AVAILABLE_ORDER: 'available:order:',
  AVAILABLE_ORDERS_ZSET: 'available:orders',
  PROCESSED_ORDER: 'processed:order:',
  ORDER_LOCK: 'lock:order:',
  ACTIVE_SHOPPERS: 'ACTIVE_SHOPPERS',
} as const;

export const ROUTING_KEYS = {
  ORDER_CREATED: 'order.created',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_ASSIGNED: 'order.assigned',
} as const;

export const WS_EVENTS = {
  ORDER_NEW: 'order.new',
  ORDER_CLOSED: 'order.closed',
} as const;
