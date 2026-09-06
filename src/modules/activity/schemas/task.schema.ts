import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Frequency, TaskPriority } from '../../../common/enums';

export type TaskDocument = HydratedDocument<Task>;

/** A daily / one-time / recurring task. (Data model ready; API stubbed.) */
@Schema({ timestamps: true })
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Date })
  dueDate?: Date;

  @Prop({ type: String, enum: Frequency, default: Frequency.ONE_TIME })
  recurrence: Frequency;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: [Number], default: [] })
  reminders: number[];

  @Prop({ type: [Types.ObjectId], ref: 'Tag', default: [] })
  tags: Types.ObjectId[];
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ userId: 1, dueDate: 1 });
TaskSchema.index({ userId: 1, completed: 1 });
