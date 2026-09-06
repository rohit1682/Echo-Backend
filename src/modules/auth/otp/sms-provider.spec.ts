import { ConsoleSmsProvider } from './sms-provider';

describe('ConsoleSmsProvider', () => {
  it('logs the code and resolves without sending a real SMS', async () => {
    const provider = new ConsoleSmsProvider();
    const warn = jest.spyOn((provider as any).logger, 'warn').mockImplementation(() => undefined);
    await expect(provider.sendOtp('+123', '654321')).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('654321'));
    warn.mockRestore();
  });
});
