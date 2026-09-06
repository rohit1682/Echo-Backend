import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Frequency, InvestmentType, RecordStatus, RiskLevel } from '../../../../common/enums';

export type InvestmentDocument = HydratedDocument<Investment>;

@Schema({ timestamps: true })
export class Investment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: InvestmentType, required: true, index: true })
  type: InvestmentType;

  @Prop({ required: true, min: 0 })
  investedAmount: number;

  /** Latest known value; may be refreshed by the price service for market assets. */
  @Prop({ required: true, min: 0 })
  currentValue: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ type: String, enum: RiskLevel, default: RiskLevel.MEDIUM })
  riskLevel: RiskLevel;

  @Prop({ type: Date, required: true })
  investmentDate: Date;

  @Prop({ type: String, enum: Frequency, default: Frequency.ONE_TIME })
  frequency: Frequency;

  @Prop({ type: Date })
  maturityDate?: Date;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.ACTIVE })
  status: RecordStatus;

  /** Ticker / ISIN / scheme code used to fetch a live price where supported. */
  @Prop({ trim: true })
  symbol?: string;

  @Prop({ type: Date })
  priceUpdatedAt?: Date;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];
}

export const InvestmentSchema = SchemaFactory.createForClass(Investment);
InvestmentSchema.index({ userId: 1, type: 1 });
InvestmentSchema.index({ userId: 1, createdAt: -1 });
