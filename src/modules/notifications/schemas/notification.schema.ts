import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

/** A reminder/notification record. (Data model ready; delivery is scaffolded.) */
@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  body?: string;

  /** e.g. 'sip', 'premium', 'birthday', 'task', 'event', 'custom'. */
  @Prop({ trim: true })
  category?: string;

  @Prop({ type: Date, required: true })
  scheduledFor: Date;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ default: false })
  read: boolean;

  /** Reference to the source document (SIP, policy, task, ...). */
  @Prop({ type: Types.ObjectId })
  sourceRef?: Types.ObjectId;

  @Prop({ type: Object })
  data?: Record<string, unknown>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1, scheduledFor: 1 });
NotificationSchema.index({ sentAt: 1, scheduledFor: 1 });
