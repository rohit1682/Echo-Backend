import { ExpoPushService } from './expo-push.service';

const mockChunk = jest.fn();
const mockSend = jest.fn();
const mockIsToken = jest.fn();

jest.mock('expo-server-sdk', () => ({
  Expo: Object.assign(
    jest.fn().mockImplementation(() => ({
      chunkPushNotifications: mockChunk,
      sendPushNotificationsAsync: mockSend,
    })),
    { isExpoPushToken: (t: string) => mockIsToken(t) },
  ),
}));

describe('ExpoPushService', () => {
  let service: ExpoPushService;

  beforeEach(() => {
    mockChunk.mockReset();
    mockSend.mockReset();
    mockIsToken.mockReset();
    service = new ExpoPushService();
  });

  it('does nothing when there are no valid tokens', async () => {
    mockIsToken.mockReturnValue(false);
    await service.send(['bad'], 'T', 'B');
    expect(mockChunk).not.toHaveBeenCalled();
  });

  it('chunks and sends notifications for valid tokens', async () => {
    mockIsToken.mockReturnValue(true);
    mockChunk.mockReturnValue([[{ to: 'ExponentPushToken[x]' }]]);
    mockSend.mockResolvedValue([{ status: 'ok' }]);
    await service.send(['ExponentPushToken[x]'], 'T', 'B', { a: 1 });
    expect(mockSend).toHaveBeenCalled();
  });

  it('swallows send errors and logs them', async () => {
    mockIsToken.mockReturnValue(true);
    mockChunk.mockReturnValue([[{ to: 'ExponentPushToken[x]' }]]);
    mockSend.mockRejectedValue(new Error('network'));
    const errSpy = jest.spyOn((service as any).logger, 'error').mockImplementation(() => undefined);
    await expect(service.send(['ExponentPushToken[x]'], 'T', 'B')).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalled();
  });
});
