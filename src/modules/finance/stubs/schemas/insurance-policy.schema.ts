import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Frequency, PolicyType, RecordStatus } from '../../../../common/enums';

export type InsurancePolicyDocument = HydratedDocument<InsurancePolicy>;

/** An insurance policy with recurring premiums. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class InsurancePolicy {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  provider?: string;

  @Prop({ type: String, enum: PolicyType, default: PolicyType.OTHER })
  policyType: PolicyType;

  @Prop({ trim: true })
  policyNumber?: string;

  @Prop({ required: true, min: 0 })
  premiumAmount: number;

  @Prop({ type: String, enum: Frequency, default: Frequency.YEARLY })
  paymentFrequency: Frequency;

  @Prop({ type: Date })
  premiumDueDate?: Date;

  @Prop({ type: Date })
  nextPremiumDate?: Date;

  @Prop({ type: Date })
  maturityDate?: Date;

  @Prop({ min: 0 })
  coverAmount?: number;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.ACTIVE })
  status: RecordStatus;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];
}

export const InsurancePolicySchema = SchemaFactory.createForClass(InsurancePolicy);
InsurancePolicySchema.index({ userId: 1, nextPremiumDate: 1 });
