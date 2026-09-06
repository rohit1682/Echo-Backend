import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TagDocument = HydratedDocument<Tag>;

/** A user-defined label (e.g. "Retirement", "High Risk", "Travel"). */
@Schema({ timestamps: true })
export class Tag {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  /** Optional hex color for chips in the UI. */
  @Prop({ default: '#6366f1' })
  color: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

// A user cannot have two tags with the same name.
TagSchema.index({ userId: 1, name: 1 }, { unique: true });
