import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let auth: any;
  let controller: AuthController;

  beforeEach(() => {
    auth = {
      register: jest.fn().mockResolvedValue('r'),
      login: jest.fn().mockResolvedValue('l'),
      google: jest.fn().mockResolvedValue('g'),
      requestOtp: jest.fn().mockResolvedValue('req'),
      verifyOtp: jest.fn().mockResolvedValue('v'),
      refresh: jest.fn().mockResolvedValue('rf'),
      logout: jest.fn().mockResolvedValue(undefined),
    };
    controller = new AuthController(auth);
  });

  it('register', async () => {
    await controller.register({ email: 'a@b.com', password: 'password1', name: 'N' } as any);
    expect(auth.register).toHaveBeenCalledWith('a@b.com', 'password1', 'N');
  });

  it('login', async () => {
    await controller.login({ email: 'a@b.com', password: 'x' } as any);
    expect(auth.login).toHaveBeenCalledWith('a@b.com', 'x');
  });

  it('google', async () => {
    await controller.google({ idToken: 't' } as any);
    expect(auth.google).toHaveBeenCalledWith('t');
  });

  it('requestOtp', async () => {
    await controller.requestOtp({ phone: '+1' } as any);
    expect(auth.requestOtp).toHaveBeenCalledWith('+1');
  });

  it('verifyOtp', async () => {
    await controller.verifyOtp({ phone: '+1', code: '000000' } as any);
    expect(auth.verifyOtp).toHaveBeenCalledWith('+1', '000000');
  });

  it('refresh', async () => {
    await controller.refresh({ refreshToken: 'rt' } as any);
    expect(auth.refresh).toHaveBeenCalledWith('rt');
  });

  it('logout', async () => {
    await controller.logout('u1');
    expect(auth.logout).toHaveBeenCalledWith('u1');
  });

  it('me returns the current principal', () => {
    const user = { userId: 'u1', email: 'a@b.com' };
    expect(controller.me(user)).toBe(user);
  });
});
