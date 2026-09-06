import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FinancialCategoryDocument = HydratedDocument<FinancialCategory>;

/** A user-defined financial category. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class FinancialCategory {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ['income', 'expense', 'both'], default: 'expense' })
  kind: 'income' | 'expense' | 'both';

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop({ trim: true })
  icon?: string;
}

export const FinancialCategorySchema = SchemaFactory.createForClass(FinancialCategory);
FinancialCategorySchema.index({ userId: 1, name: 1 }, { unique: true });
