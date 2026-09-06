import { Logger } from '@nestjs/common';

/** Injection token for the active SMS provider. */
export const SMS_PROVIDER = 'SMS_PROVIDER';

/**
 * Pluggable SMS delivery. The free `ConsoleSmsProvider` is the default; a paid
 * provider (Twilio, MSG91) or an email-OTP provider can be swapped in behind
 * this interface without touching auth logic.
 */
export interface SmsProvider {
  sendOtp(phone: string, code: string): Promise<void>;
}

/** Free dev provider: logs the OTP to the server console instead of sending SMS. */
export class ConsoleSmsProvider implements SmsProvider {
  private readonly logger = new Logger('ConsoleSmsProvider');

  sendOtp(phone: string, code: string): Promise<void> {
    this.logger.warn(`[DEV OTP] Code for ${phone} is ${code} (no real SMS sent)`);
    return Promise.resolve();
  }
}
