import { NotImplementedException } from '@nestjs/common';
import { createStubController } from './stub.controller';

describe('createStubController', () => {
  const StubController = createStubController('finance/sips', 'SIP tracking') as any;
  const instance = new StubController();

  it('returns a safe empty payload from list()', () => {
    expect(instance.list()).toEqual({
      items: [],
      message: 'SIP tracking is coming soon',
      implemented: false,
    });
  });

  it('throws NotImplemented from create()', () => {
    expect(() => instance.create()).toThrow(NotImplementedException);
  });
});
