import { NotificationsController } from './notifications.controller';

describe('NotificationsController', () => {
  let svc: any;
  let controller: NotificationsController;

  beforeEach(() => {
    svc = {
      list: jest.fn().mockResolvedValue(['n']),
      markRead: jest.fn().mockResolvedValue('r'),
      registerPushToken: jest.fn().mockResolvedValue(undefined),
      removePushToken: jest.fn().mockResolvedValue(undefined),
    };
    controller = new NotificationsController(svc);
  });

  it('list', async () => {
    await controller.list('u1');
    expect(svc.list).toHaveBeenCalledWith('u1');
  });
  it('markRead', async () => {
    await controller.markRead('u1', 'n1');
    expect(svc.markRead).toHaveBeenCalledWith('u1', 'n1');
  });
  it('register', async () => {
    await controller.register('u1', { token: 'tok-1234567890' } as any);
    expect(svc.registerPushToken).toHaveBeenCalledWith('u1', 'tok-1234567890');
  });
  it('unregister', async () => {
    await controller.unregister('u1', { token: 'tok-1234567890' } as any);
    expect(svc.removePushToken).toHaveBeenCalledWith('u1', 'tok-1234567890');
  });
});
