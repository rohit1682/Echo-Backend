import { Types } from 'mongoose';
import { ReminderSchedulerService } from './reminder-scheduler.service';

function due(overrides: any = {}) {
  return {
    userId: new Types.ObjectId(),
    title: 'T',
    body: 'B',
    data: undefined,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ReminderSchedulerService', () => {
  let model: any;
  let push: any;
  let users: any;
  let service: ReminderSchedulerService;

  beforeEach(() => {
    model = { find: jest.fn() };
    push = { send: jest.fn().mockResolvedValue(undefined) };
    users = { findById: jest.fn() };
    service = new ReminderSchedulerService(model, push, users);
  });

  const findReturns = (docs: any[]) =>
    model.find.mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(docs),
    });

  it('does nothing when there are no due notifications', async () => {
    findReturns([]);
    await service.deliverDue();
    expect(users.findById).not.toHaveBeenCalled();
  });

  it('sends a push and marks notifications sent when the user has tokens', async () => {
    const withBody = due({ body: 'B' });
    const withoutBody = due({ body: undefined });
    findReturns([withBody, withoutBody]);
    users.findById.mockResolvedValue({ expoPushTokens: ['ExponentPushToken[x]'] });
    await service.deliverDue();
    expect(push.send).toHaveBeenCalledTimes(2);
    expect(push.send).toHaveBeenCalledWith(['ExponentPushToken[x]'], 'T', '', undefined);
    expect(withBody.save).toHaveBeenCalled();
    expect(withBody.sentAt).toBeInstanceOf(Date);
  });

  it('marks sent without pushing when the user is missing', async () => {
    const n = due();
    findReturns([n]);
    users.findById.mockResolvedValue(null);
    await service.deliverDue();
    expect(push.send).not.toHaveBeenCalled();
    expect(n.save).toHaveBeenCalled();
  });

  it('marks sent without pushing when the user has an empty token list', async () => {
    const n = due();
    findReturns([n]);
    users.findById.mockResolvedValue({});
    await service.deliverDue();
    expect(push.send).not.toHaveBeenCalled();
    expect(n.save).toHaveBeenCalled();
  });
});
