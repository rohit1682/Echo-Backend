/**
 * Lightweight environment validation run at bootstrap. We keep it dependency-free
 * (no Joi) so the app fails fast with a clear message when required vars are missing
 * in production, while staying permissive in development.
 */
export function validateEnv(config: Record<string, unknown>): Record<string, unknown> {
  const env = (config.NODE_ENV as string) ?? 'development';

  if (env === 'production') {
    const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = required.filter((key) => !config[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missing.join(', ')}`,
      );
    }

    const weak = ['change-me-access-secret', 'change-me-refresh-secret', 'dev-access-secret'];
    if (
      weak.includes(config.JWT_ACCESS_SECRET as string) ||
      weak.includes(config.JWT_REFRESH_SECRET as string)
    ) {
      throw new Error(
        'Refusing to start in production with default JWT secrets. Set strong secrets.',
      );
    }
  }

  return config;
}
