import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

function makeContext(): any {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({ getRequest: () => ({}) }),
  };
}

describe('JwtAuthGuard', () => {
  let reflector: Reflector;
  let guard: JwtAuthGuard;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
    guard = new JwtAuthGuard(reflector);
  });

  it('allows public routes without authentication', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    expect(guard.canActivate(makeContext())).toBe(true);
  });

  it('delegates to passport for protected routes', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const superProto = Object.getPrototypeOf(JwtAuthGuard.prototype);
    const spy = jest.spyOn(superProto, 'canActivate').mockReturnValue(true as any);
    expect(guard.canActivate(makeContext())).toBe(true);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('handleRequest returns the user when present', () => {
    const user = { userId: 'u1' };
    expect(guard.handleRequest(null, user)).toBe(user);
  });

  it('handleRequest throws the original error when present', () => {
    const err = new Error('boom');
    expect(() => guard.handleRequest(err, null)).toThrow(err);
  });

  it('handleRequest throws Unauthorized when there is no user', () => {
    expect(() => guard.handleRequest(null, null)).toThrow(UnauthorizedException);
  });
});
