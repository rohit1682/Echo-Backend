import { NetWorthController } from './networth.controller';

describe('NetWorthController', () => {
  let svc: any;
  let controller: NetWorthController;

  beforeEach(() => {
    svc = {
      compute: jest.fn().mockResolvedValue({ netWorth: 1 }),
      history: jest.fn().mockResolvedValue(['s']),
      captureSnapshot: jest.fn().mockResolvedValue({ id: 's1' }),
    };
    controller = new NetWorthController(svc);
  });

  it('current', async () => {
    await controller.current('u1');
    expect(svc.compute).toHaveBeenCalledWith('u1');
  });

  it('history with explicit limit', async () => {
    await controller.history('u1', '30');
    expect(svc.history).toHaveBeenCalledWith('u1', 30);
  });

  it('history with default limit', async () => {
    await controller.history('u1', undefined);
    expect(svc.history).toHaveBeenCalledWith('u1', 90);
  });

  it('snapshot', async () => {
    await controller.snapshot('u1');
    expect(svc.captureSnapshot).toHaveBeenCalledWith('u1');
  });
});
