import { currentUserFactory } from './current-user.decorator';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

function ctxWithUser(user: unknown): any {
  return { switchToHttp: () => ({ getRequest: () => ({ user }) }) };
}

describe('currentUserFactory', () => {
  it('returns the whole user when no key is given', () => {
    const user = { userId: 'u1', email: 'a@b.com' };
    expect(currentUserFactory(undefined, ctxWithUser(user))).toEqual(user);
  });

  it('plucks a single field when a key is given', () => {
    const user = { userId: 'u1', email: 'a@b.com' };
    expect(currentUserFactory('userId', ctxWithUser(user))).toBe('u1');
  });

  it('is safe when there is no user on the request', () => {
    expect(currentUserFactory('userId', ctxWithUser(undefined))).toBeUndefined();
  });
});

describe('Public decorator', () => {
  it('marks the target with the public metadata key', () => {
    class Demo {
      @Public()
      handler() {}
    }
    const value = Reflect.getMetadata(IS_PUBLIC_KEY, Demo.prototype.handler);
    expect(value).toBe(true);
  });
});
