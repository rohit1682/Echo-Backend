/**
 * Central typed configuration loaded from environment variables.
 * Registered via `ConfigModule.forRoot({ load: [configuration] })`.
 */
export interface AppConfig {
  env: string;
  port: number;
  corsOrigins: string[];
  mongoUri: string;
  jwt: {
    accessSecret: string;
    accessTtl: string;
    refreshSecret: string;
    refreshTtl: string;
  };
  googleClientIds: string[];
  anthropic: {
    apiKey: string;
    model: string;
  };
  otp: {
    provider: string;
    ttlSeconds: number;
  };
  prices: {
    provider: string;
    apiKey: string;
  };
}

const splitCsv = (value?: string): string[] =>
  (value ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

export default (): AppConfig => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  corsOrigins: splitCsv(process.env.CORS_ORIGINS ?? '*'),
  mongoUri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/echo',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },
  googleClientIds: splitCsv(process.env.GOOGLE_CLIENT_IDS),
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-5',
  },
  otp: {
    provider: process.env.SMS_PROVIDER ?? 'console',
    ttlSeconds: parseInt(process.env.OTP_TTL_SECONDS ?? '300', 10),
  },
  prices: {
    provider: process.env.PRICE_PROVIDER ?? 'mock',
    apiKey: process.env.PRICE_API_KEY ?? '',
  },
});
