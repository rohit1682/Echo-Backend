import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from './auth.service';
import { AuthProvider } from '../../common/enums';

jest.mock('bcryptjs');
jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn(() => ({ verifyIdToken: jest.fn() })),
}));

describe('AuthService', () => {
  let users: any;
  let jwt: any;
  let config: any;
  let otp: any;
  let service: AuthService;
  let googleIds: string[];
  let verifyIdToken: jest.Mock;

  const demoUser = { id: 'u1', email: 'a@b.com', passwordHash: 'ph', refreshTokenHash: 'rth' };

  beforeEach(() => {
    googleIds = ['client-id'];
    users = {
      findByEmail: jest.fn(),
      create: jest.fn().mockResolvedValue(demoUser),
      findByProvider: jest.fn(),
      linkProvider: jest.fn().mockResolvedValue(undefined),
      findByPhone: jest.fn(),
      findByIdWithSecrets: jest.fn(),
      setRefreshTokenHash: jest.fn().mockResolvedValue(undefined),
    };
    jwt = { signAsync: jest.fn().mockResolvedValue('tok'), verifyAsync: jest.fn() };
    config = {
      get: jest.fn((key: string, def?: unknown) => {
        const map: Record<string, unknown> = {
          googleClientIds: googleIds,
          'jwt.accessSecret': 'as',
          'jwt.accessTtl': '15m',
          'jwt.refreshSecret': 'rs',
          'jwt.refreshTtl': '30d',
        };
        return key in map ? map[key] : def;
      }),
    };
    otp = { request: jest.fn().mockResolvedValue({ expiresInSeconds: 300 }), verify: jest.fn() };
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    service = new AuthService(users, jwt, config, otp);
    verifyIdToken = (OAuth2Client as unknown as jest.Mock).mock.results.at(-1)!.value.verifyIdToken;
  });

  // ---- register ----
  it('register throws on a duplicate email', async () => {
    users.findByEmail.mockResolvedValue(demoUser);
    await expect(service.register('a@b.com', 'password1')).rejects.toThrow(ConflictException);
  });

  it('register creates the user and issues tokens', async () => {
    users.findByEmail.mockResolvedValue(null);
    const res = await service.register('A@B.com', 'password1', 'Name');
    expect(res).toEqual({ accessToken: 'tok', refreshToken: 'tok', user: demoUser });
    expect(users.setRefreshTokenHash).toHaveBeenCalledWith('u1', 'hashed');
  });

  // ---- login ----
  it('login rejects an unknown user', async () => {
    users.findByEmail.mockResolvedValue(null);
    await expect(service.login('a@b.com', 'x')).rejects.toThrow(UnauthorizedException);
  });

  it('login rejects a wrong password', async () => {
    users.findByEmail.mockResolvedValue(demoUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.login('a@b.com', 'x')).rejects.toThrow(UnauthorizedException);
  });

  it('login succeeds with the right password', async () => {
    users.findByEmail.mockResolvedValue(demoUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(service.login('a@b.com', 'ok')).resolves.toMatchObject({ user: demoUser });
  });

  // ---- google ----
  it('google throws when not configured', async () => {
    googleIds = [];
    await expect(service.google('idtok')).rejects.toThrow(/not configured/);
  });

  it('google throws on an invalid token', async () => {
    verifyIdToken.mockResolvedValue({ getPayload: () => undefined });
    await expect(service.google('idtok')).rejects.toThrow(/Invalid Google token/);
  });

  it('google signs in an existing provider user', async () => {
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'g1', email: 'a@b.com' }) });
    users.findByProvider.mockResolvedValue(demoUser);
    await expect(service.google('idtok')).resolves.toMatchObject({ user: demoUser });
    expect(users.create).not.toHaveBeenCalled();
  });

  it('google links google to an existing email account', async () => {
    verifyIdToken.mockResolvedValue({ getPayload: () => ({ sub: 'g1', email: 'a@b.com' }) });
    users.findByProvider.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(demoUser);
    await service.google('idtok');
    expect(users.linkProvider).toHaveBeenCalledWith('u1', AuthProvider.GOOGLE, 'g1');
  });

  it('google creates a brand new user', async () => {
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'g1',
        email: 'new@b.com',
        name: 'N',
        picture: 'p',
        email_verified: true,
      }),
    });
    users.findByProvider.mockResolvedValue(null);
    users.findByEmail.mockResolvedValue(null);
    await service.google('idtok');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'new@b.com', emailVerified: true }),
    );
  });

  // ---- otp ----
  it('requestOtp delegates to the otp service', async () => {
    await expect(service.requestOtp('+123')).resolves.toEqual({ expiresInSeconds: 300 });
  });

  it('verifyOtp signs in an existing phone user', async () => {
    otp.verify.mockResolvedValue(true);
    users.findByPhone.mockResolvedValue(demoUser);
    await expect(service.verifyOtp('+123', '000000')).resolves.toMatchObject({ user: demoUser });
    expect(users.create).not.toHaveBeenCalled();
  });

  it('verifyOtp creates a new phone user', async () => {
    otp.verify.mockResolvedValue(true);
    users.findByPhone.mockResolvedValue(null);
    await service.verifyOtp('+123', '000000');
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+123', phoneVerified: true }),
    );
  });

  // ---- refresh / logout ----
  it('refresh rejects an invalid token', async () => {
    jwt.verifyAsync.mockRejectedValue(new Error('bad'));
    await expect(service.refresh('rt')).rejects.toThrow(/Invalid or expired/);
  });

  it('refresh rejects a revoked session', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1' });
    users.findByIdWithSecrets.mockResolvedValue({ id: 'u1' });
    await expect(service.refresh('rt')).rejects.toThrow(/Session revoked/);
  });

  it('refresh revokes on a token mismatch', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1' });
    users.findByIdWithSecrets.mockResolvedValue(demoUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.refresh('rt')).rejects.toThrow(/no longer valid/);
    expect(users.setRefreshTokenHash).toHaveBeenCalledWith('u1', null);
  });

  it('refresh rotates tokens on success', async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: 'u1' });
    users.findByIdWithSecrets.mockResolvedValue(demoUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(service.refresh('rt')).resolves.toEqual({
      accessToken: 'tok',
      refreshToken: 'tok',
    });
  });

  it('logout clears the refresh token', async () => {
    await service.logout('u1');
    expect(users.setRefreshTokenHash).toHaveBeenCalledWith('u1', null);
  });
});
