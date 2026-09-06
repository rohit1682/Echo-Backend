import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Frequency, RecordStatus } from '../../../../common/enums';

export type SipDocument = HydratedDocument<Sip>;

/** A systematic/recurring investment plan. (Data model ready; API is stubbed.) */
@Schema({ timestamps: true })
export class Sip {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  fundName?: string;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: String, enum: Frequency, default: Frequency.MONTHLY })
  frequency: Frequency;

  @Prop({ type: Date, required: true })
  startDate: Date;

  /** Day of month the deduction happens (1-31). */
  @Prop({ min: 1, max: 31 })
  deductionDay?: number;

  @Prop({ type: Date })
  nextPaymentDate?: Date;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.ACTIVE })
  status: RecordStatus;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];
}

export const SipSchema = SchemaFactory.createForClass(Sip);
SipSchema.index({ userId: 1, nextPaymentDate: 1 });
