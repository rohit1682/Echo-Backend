import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { RecommendationDomain, RecommendationSeverity } from '../../../common/enums';

export type RecommendationDocument = HydratedDocument<Recommendation>;

/** A persisted Advisor recommendation (history of what Echo suggested). */
@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: RecommendationDomain, required: true })
  domain: RecommendationDomain;

  @Prop({ type: String, enum: RecommendationSeverity, required: true })
  severity: RecommendationSeverity;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop()
  code?: string;

  @Prop({ type: String, enum: ['rules', 'llm'], default: 'rules' })
  source: 'rules' | 'llm';

  @Prop({ default: false })
  dismissed: boolean;

  @Prop({ type: Date, required: true, default: () => new Date() })
  generatedAt: Date;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);
RecommendationSchema.index({ userId: 1, generatedAt: -1 });
