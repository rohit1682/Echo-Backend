import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PriceQuoteDocument = HydratedDocument<PriceQuote>;

/** Cached market quote for a symbol, shared across users to respect API limits. */
@Schema({ timestamps: true })
export class PriceQuote {
  @Prop({ required: true, uppercase: true, trim: true, unique: true })
  symbol: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: 'INR' })
  currency: string;

  @Prop({ type: Date, required: true, default: () => new Date() })
  fetchedAt: Date;
}

export const PriceQuoteSchema = SchemaFactory.createForClass(PriceQuote);
