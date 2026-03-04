export const configuration = () => ({
  port: parseInt(process.env.PORT ?? '3100', 10),
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://admin:admin123@localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE ?? 'order.exchange',
    queue: process.env.RABBITMQ_QUEUE ?? 'order.dispatch.queue',
    prefetch: parseInt(process.env.RABBITMQ_PREFETCH ?? '10', 10),
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    issuer: process.env.JWT_ISSUER ?? 'http://localhost:7000',
    audience: process.env.JWT_AUDIENCE ?? 'OrderDispatcher-api',
  },
  ttl: {
    availableOrder: parseInt(process.env.AVAILABLE_ORDER_TTL ?? '900', 10),
    orderLock: parseInt(process.env.ORDER_LOCK_TTL ?? '5', 10),
    idempotency: parseInt(process.env.IDEMPOTENCY_TTL ?? '3600', 10),
  },
});
