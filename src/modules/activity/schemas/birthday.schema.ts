import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BirthdayDocument = HydratedDocument<Birthday>;

/** A birthday / anniversary / important date. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class Birthday {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: String, enum: ['birthday', 'anniversary', 'other'], default: 'birthday' })
  kind: 'birthday' | 'anniversary' | 'other';

  /** Month/day always set; year optional when unknown. */
  @Prop({ required: true, min: 1, max: 12 })
  month: number;

  @Prop({ required: true, min: 1, max: 31 })
  day: number;

  @Prop()
  year?: number;

  /** Provenance: manual entry or imported from device contacts. */
  @Prop({ type: String, enum: ['manual', 'contact'], default: 'manual' })
  source: 'manual' | 'contact';

  @Prop({ trim: true })
  contactId?: string;

  @Prop({ type: [Number], default: [0, 1] })
  reminders: number[];

  @Prop({ trim: true })
  notes?: string;
}

export const BirthdaySchema = SchemaFactory.createForClass(Birthday);
BirthdaySchema.index({ userId: 1, month: 1, day: 1 });
