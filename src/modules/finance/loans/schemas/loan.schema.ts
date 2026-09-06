import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RecordStatus } from '../../../../common/enums';

export type LoanDocument = HydratedDocument<Loan>;

/** A loan / EMI liability. Feeds net-worth (outstanding is subtracted). */
@Schema({ timestamps: true })
export class Loan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  lender?: string;

  @Prop({ required: true, min: 0 })
  principal: number;

  @Prop({ required: true, min: 0 })
  outstanding: number;

  /** Annual interest rate as a percentage, e.g. 8.5. */
  @Prop({ min: 0, default: 0 })
  interestRate: number;

  @Prop({ min: 0, default: 0 })
  emiAmount: number;

  /** Total tenure in months. */
  @Prop({ min: 0 })
  tenureMonths?: number;

  @Prop({ type: Date })
  startDate?: Date;

  @Prop({ type: Date })
  nextDueDate?: Date;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.ACTIVE })
  status: RecordStatus;

  @Prop({ trim: true })
  notes?: string;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);
LoanSchema.index({ userId: 1, status: 1 });
