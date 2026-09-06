import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Otp, OtpDocument } from './otp.schema';
import { SMS_PROVIDER, SmsProvider } from './sms-provider';

const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
    private readonly config: ConfigService,
  ) {}

  /** Generate, store (hashed) and dispatch a fresh OTP for a phone number. */
  async request(phone: string): Promise<{ expiresInSeconds: number }> {
    const ttl = this.config.get<number>('otp.ttlSeconds', 300);
    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
    const codeHash = await bcrypt.hash(code, 10);

    // Replace any existing challenge for this phone.
    await this.otpModel.deleteMany({ phone }).exec();
    await this.otpModel.create({
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + ttl * 1000),
    });

    await this.sms.sendOtp(phone, code);
    return { expiresInSeconds: ttl };
  }

  /** Verify a submitted code; consumes the challenge on success. */
  async verify(phone: string, code: string): Promise<boolean> {
    const otp = await this.otpModel.findOne({ phone }).sort({ createdAt: -1 }).exec();
    if (!otp || otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired or not requested');
    }
    if (otp.attempts >= MAX_ATTEMPTS) {
      await this.otpModel.deleteMany({ phone }).exec();
      throw new BadRequestException('Too many attempts, request a new code');
    }

    const ok = await bcrypt.compare(code, otp.codeHash);
    if (!ok) {
      otp.attempts += 1;
      await otp.save();
      throw new BadRequestException('Invalid code');
    }

    await this.otpModel.deleteMany({ phone }).exec();
    return true;
  }
}
