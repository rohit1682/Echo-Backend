import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Frequency, RecordStatus } from '../../../../common/enums';

export type SubscriptionDocument = HydratedDocument<Subscription>;

/** A recurring subscription (e.g. streaming). (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: Frequency, default: Frequency.MONTHLY })
  billingCycle: Frequency;

  @Prop({ type: Date })
  nextRenewalDate?: Date;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.ACTIVE })
  status: RecordStatus;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ trim: true })
  notes?: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ userId: 1, nextRenewalDate: 1 });
