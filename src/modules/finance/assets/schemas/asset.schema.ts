import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AssetCategory } from '../../../../common/enums';

export type AssetDocument = HydratedDocument<Asset>;

/** A manually tracked asset (real estate, vehicle, gold, savings, custom). */
@Schema({ timestamps: true })
export class Asset {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: AssetCategory, default: AssetCategory.OTHER })
  category: AssetCategory;

  /** Free-form category label when the user defines their own bucket. */
  @Prop({ trim: true })
  customCategory?: string;

  @Prop({ required: true, min: 0 })
  currentValue: number;

  @Prop({ min: 0 })
  purchaseValue?: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ type: Date })
  acquiredDate?: Date;

  @Prop({ trim: true })
  notes?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
AssetSchema.index({ userId: 1, category: 1 });
