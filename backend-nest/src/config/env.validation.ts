import { plainToInstance } from 'class-transformer';
import { IsEnum, IsString, IsOptional, validateSync, IsNumber } from 'class-validator';

class EnvironmentVariables {
  @IsEnum(['development', 'production', 'test'])
  @IsOptional()
  NODE_ENV: string = 'development';

  @IsNumber()
  @IsOptional()
  PORT: number = 4000;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  @IsOptional()
  DB_HOST?: string;

  @IsNumber()
  @IsOptional()
  DB_PORT?: number;

  @IsString()
  @IsOptional()
  DB_USERNAME?: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DB_NAME?: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  @IsOptional()
  SENDGRID_API_KEY?: string;

  @IsString()
  @IsOptional()
  FIREBASE_SERVICE_ACCOUNT?: string;
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }

  // Cross-field validation: either connection URL or host must be specified
  if (!validatedConfig.DATABASE_URL && !validatedConfig.DB_HOST) {
    throw new Error('Config validation error: Either DATABASE_URL or DB_HOST must be provided.');
  }

  // Production-only validation
  if (validatedConfig.NODE_ENV === 'production') {
    if (!validatedConfig.SENDGRID_API_KEY) {
      throw new Error('Config validation error: SENDGRID_API_KEY is required in production.');
    }
    if (!validatedConfig.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('Config validation error: FIREBASE_SERVICE_ACCOUNT is required in production.');
    }
  }

  return validatedConfig;
}
