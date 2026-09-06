import configuration from './configuration';

describe('configuration', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('falls back to sensible defaults when nothing is set', () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.CORS_ORIGINS;
    delete process.env.MONGODB_URI;
    delete process.env.GOOGLE_CLIENT_IDS;
    delete process.env.ANTHROPIC_MODEL;
    delete process.env.SMS_PROVIDER;
    delete process.env.OTP_TTL_SECONDS;
    delete process.env.PRICE_PROVIDER;

    const config = configuration();
    expect(config.env).toBe('development');
    expect(config.port).toBe(4001);
    expect(config.corsOrigins).toEqual(['*']);
    expect(config.mongoUri).toContain('mongodb://');
    expect(config.googleClientIds).toEqual([]);
    expect(config.anthropic.model).toBe('claude-opus-5');
    expect(config.otp.provider).toBe('console');
    expect(config.otp.ttlSeconds).toBe(300);
    expect(config.prices.provider).toBe('mock');
  });

  it('reads and parses values from the environment', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';
    process.env.CORS_ORIGINS = 'https://a.com, https://b.com ,';
    process.env.MONGODB_URI = 'mongodb+srv://x/echo';
    process.env.JWT_ACCESS_SECRET = 'acc';
    process.env.JWT_ACCESS_TTL = '10m';
    process.env.JWT_REFRESH_SECRET = 'ref';
    process.env.JWT_REFRESH_TTL = '7d';
    process.env.GOOGLE_CLIENT_IDS = 'id1,id2';
    process.env.ANTHROPIC_API_KEY = 'key';
    process.env.ANTHROPIC_MODEL = 'claude-sonnet-5';
    process.env.SMS_PROVIDER = 'twilio';
    process.env.OTP_TTL_SECONDS = '120';
    process.env.PRICE_PROVIDER = 'real';
    process.env.PRICE_API_KEY = 'pk';

    const config = configuration();
    expect(config.env).toBe('production');
    expect(config.port).toBe(8080);
    expect(config.corsOrigins).toEqual(['https://a.com', 'https://b.com']);
    expect(config.jwt).toEqual({
      accessSecret: 'acc',
      accessTtl: '10m',
      refreshSecret: 'ref',
      refreshTtl: '7d',
    });
    expect(config.googleClientIds).toEqual(['id1', 'id2']);
    expect(config.anthropic).toEqual({ apiKey: 'key', model: 'claude-sonnet-5' });
    expect(config.otp).toEqual({ provider: 'twilio', ttlSeconds: 120 });
    expect(config.prices).toEqual({ provider: 'real', apiKey: 'pk' });
  });
});
