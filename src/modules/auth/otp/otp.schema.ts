import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

/**
 * A one-time passcode challenge. Documents auto-expire via a TTL index on
 * `expiresAt`, so stale codes are cleaned up by MongoDB automatically.
 */
@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, index: true })
  phone: string;

  /** bcrypt hash of the numeric code — never stored in plaintext. */
  @Prop({ required: true })
  codeHash: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// TTL index — MongoDB removes the doc once `expiresAt` passes.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
