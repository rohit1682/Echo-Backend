import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PremiumPaymentDocument = HydratedDocument<PremiumPayment>;

/** A single premium payment against a policy. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class PremiumPayment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'InsurancePolicy', required: true, index: true })
  policyId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: Date })
  paidDate?: Date;

  @Prop({ default: false })
  paid: boolean;

  @Prop({ default: 'INR' })
  currency: string;
}

export const PremiumPaymentSchema = SchemaFactory.createForClass(PremiumPayment);
PremiumPaymentSchema.index({ userId: 1, dueDate: 1 });
