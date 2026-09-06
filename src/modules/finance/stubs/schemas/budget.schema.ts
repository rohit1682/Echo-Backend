import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Frequency } from '../../../../common/enums';

export type BudgetDocument = HydratedDocument<Budget>;

/** A spending budget for a category/period. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class Budget {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'FinancialCategory' })
  categoryId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  limit: number;

  @Prop({ type: String, enum: Frequency, default: Frequency.MONTHLY })
  period: Frequency;

  @Prop({ default: 'INR' })
  currency: string;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
