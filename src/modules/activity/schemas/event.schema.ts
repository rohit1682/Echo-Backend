import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { EventType, Frequency } from '../../../common/enums';

export type EventDocument = HydratedDocument<Event>;

/** A calendar event/activity. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: String, enum: EventType, default: EventType.PERSONAL })
  type: EventType;

  @Prop({ type: Date, required: true })
  startAt: Date;

  @Prop({ type: Date })
  endAt?: Date;

  @Prop({ default: false })
  allDay: boolean;

  @Prop({ type: String, enum: Frequency, default: Frequency.ONE_TIME })
  recurrence: Frequency;

  @Prop({ trim: true })
  location?: string;

  @Prop({ trim: true })
  notes?: string;

  /** Reminder lead times in days-before. */
  @Prop({ type: [Number], default: [] })
  reminders: number[];

  /** Set when synced from / to the device calendar. */
  @Prop({ trim: true })
  deviceCalendarId?: string;

  /** Link back to a finance record (e.g. SIP/premium due date). */
  @Prop({ type: Types.ObjectId })
  sourceRef?: Types.ObjectId;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ userId: 1, startAt: 1 });
