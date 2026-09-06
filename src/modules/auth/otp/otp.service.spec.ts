import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { OtpService } from './otp.service';

jest.mock('bcryptjs');

function chain(result: unknown) {
  return { sort: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(result) };
}

describe('OtpService', () => {
  let model: any;
  let sms: any;
  let config: any;
  let service: OtpService;

  beforeEach(() => {
    model = {
      deleteMany: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
      create: jest.fn().mockResolvedValue({}),
      findOne: jest.fn(),
    };
    sms = { sendOtp: jest.fn().mockResolvedValue(undefined) };
    config = { get: jest.fn().mockReturnValue(300) };
    service = new OtpService(model, sms, config);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
  });

  it('request generates, stores and sends a code', async () => {
    const res = await service.request('+123');
    expect(res).toEqual({ expiresInSeconds: 300 });
    expect(model.deleteMany).toHaveBeenCalledWith({ phone: '+123' });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '+123', codeHash: 'hashed' }),
    );
    expect(sms.sendOtp).toHaveBeenCalledWith('+123', expect.stringMatching(/^\d{6}$/));
  });

  it('verify throws when no challenge exists', async () => {
    model.findOne.mockReturnValue(chain(null));
    await expect(service.verify('+123', '000000')).rejects.toThrow(BadRequestException);
  });

  it('verify throws when the code is expired', async () => {
    model.findOne.mockReturnValue(chain({ expiresAt: new Date(Date.now() - 1000), attempts: 0 }));
    await expect(service.verify('+123', '000000')).rejects.toThrow(/expired/);
  });

  it('verify throws and clears after too many attempts', async () => {
    model.findOne.mockReturnValue(chain({ expiresAt: new Date(Date.now() + 10000), attempts: 5 }));
    await expect(service.verify('+123', '000000')).rejects.toThrow(/Too many attempts/);
    expect(model.deleteMany).toHaveBeenCalledWith({ phone: '+123' });
  });

  it('verify increments attempts on a wrong code', async () => {
    const otp = { expiresAt: new Date(Date.now() + 10000), attempts: 1, save: jest.fn() };
    model.findOne.mockReturnValue(chain(otp));
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    await expect(service.verify('+123', '111111')).rejects.toThrow(/Invalid code/);
    expect(otp.attempts).toBe(2);
    expect(otp.save).toHaveBeenCalled();
  });

  it('verify consumes the challenge on success', async () => {
    const otp = { expiresAt: new Date(Date.now() + 10000), attempts: 0, save: jest.fn() };
    model.findOne.mockReturnValue(chain(otp));
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    await expect(service.verify('+123', '123456')).resolves.toBe(true);
    expect(model.deleteMany).toHaveBeenCalledWith({ phone: '+123' });
  });
});
