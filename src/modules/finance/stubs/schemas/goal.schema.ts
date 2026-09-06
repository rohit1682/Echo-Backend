import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GoalDocument = HydratedDocument<Goal>;

/** A savings goal with progress. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class Goal {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 0 })
  targetAmount: number;

  @Prop({ default: 0, min: 0 })
  currentAmount: number;

  @Prop({ type: Date })
  targetDate?: Date;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ trim: true })
  icon?: string;

  /** Investments/assets earmarked toward this goal. */
  @Prop({ type: [Types.ObjectId], default: [] })
  linkedHoldings: Types.ObjectId[];

  @Prop({ trim: true })
  notes?: string;
}

export const GoalSchema = SchemaFactory.createForClass(Goal);
GoalSchema.index({ userId: 1, targetDate: 1 });
