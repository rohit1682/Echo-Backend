import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let model: any;
  let users: any;
  let service: NotificationsService;

  beforeEach(() => {
    model = { find: jest.fn(), findOneAndUpdate: jest.fn() };
    users = {
      addPushToken: jest.fn().mockResolvedValue(undefined),
      removePushToken: jest.fn().mockResolvedValue(undefined),
    };
    service = new NotificationsService(model, users);
  });

  it('list returns the latest notifications', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['n']),
    });
    await expect(service.list('u1')).resolves.toEqual(['n']);
  });

  it('markRead returns the updated doc', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ read: true }) });
    await expect(service.markRead('u1', 'n1')).resolves.toEqual({ read: true });
  });

  it('markRead throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.markRead('u1', 'n1')).rejects.toThrow(NotFoundException);
  });

  it('registerPushToken / removePushToken delegate to users', async () => {
    await service.registerPushToken('u1', 'tok');
    expect(users.addPushToken).toHaveBeenCalledWith('u1', 'tok');
    await service.removePushToken('u1', 'tok');
    expect(users.removePushToken).toHaveBeenCalledWith('u1', 'tok');
  });
});
