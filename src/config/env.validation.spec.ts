import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  it('returns config unchanged in development', () => {
    const cfg = { NODE_ENV: 'development' };
    expect(validateEnv(cfg)).toBe(cfg);
  });

  it('returns config unchanged when NODE_ENV is absent (defaults to development)', () => {
    const cfg = {};
    expect(validateEnv(cfg)).toBe(cfg);
  });

  it('throws in production when required vars are missing', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(/Missing required/);
  });

  it('throws in production when JWT secrets are the defaults', () => {
    expect(() =>
      validateEnv({
        NODE_ENV: 'production',
        MONGODB_URI: 'mongodb://x/echo',
        JWT_ACCESS_SECRET: 'change-me-access-secret',
        JWT_REFRESH_SECRET: 'change-me-refresh-secret',
      }),
    ).toThrow(/default JWT secrets/);
  });

  it('passes in production with strong secrets', () => {
    const cfg = {
      NODE_ENV: 'production',
      MONGODB_URI: 'mongodb://x/echo',
      JWT_ACCESS_SECRET: 'a-strong-unique-secret-value',
      JWT_REFRESH_SECRET: 'another-strong-unique-secret',
    };
    expect(validateEnv(cfg)).toBe(cfg);
  });
});
