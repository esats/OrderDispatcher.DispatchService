import { plainToInstance } from 'class-transformer';
import { IsNumber, IsOptional, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  RABBITMQ_URL!: string;

  @IsString()
  @IsOptional()
  RABBITMQ_EXCHANGE?: string;

  @IsString()
  @IsOptional()
  RABBITMQ_QUEUE?: string;

  @IsNumber()
  @IsOptional()
  RABBITMQ_PREFETCH?: number;

  @IsString()
  REDIS_HOST!: string;

  @IsNumber()
  @IsOptional()
  REDIS_PORT?: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD?: string;

  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsNumber()
  @IsOptional()
  AVAILABLE_ORDER_TTL?: number;

  @IsNumber()
  @IsOptional()
  ORDER_LOCK_TTL?: number;

  @IsNumber()
  @IsOptional()
  IDEMPOTENCY_TTL?: number;
}

export function validateEnv(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validated;
}
