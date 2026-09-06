import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('maps the token payload to the auth user', () => {
    const config = { get: jest.fn().mockReturnValue('access-secret') } as any;
    const strategy = new JwtStrategy(config);
    expect(strategy.validate({ sub: 'u1', email: 'a@b.com' })).toEqual({
      userId: 'u1',
      email: 'a@b.com',
    });
  });
});
