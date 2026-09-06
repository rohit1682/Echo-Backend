import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NetWorthSnapshotDocument = HydratedDocument<NetWorthSnapshot>;

/** A point-in-time net-worth reading, used to draw the trend chart over time. */
@Schema({ timestamps: true })
export class NetWorthSnapshot {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  totalAssets: number;

  @Prop({ required: true })
  totalLiabilities: number;

  @Prop({ required: true })
  netWorth: number;

  @Prop({ type: Date, required: true, default: () => new Date() })
  capturedAt: Date;
}

export const NetWorthSnapshotSchema = SchemaFactory.createForClass(NetWorthSnapshot);
NetWorthSnapshotSchema.index({ userId: 1, capturedAt: -1 });
