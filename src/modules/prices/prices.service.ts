import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PriceQuote, PriceQuoteDocument } from './schemas/price-quote.schema';
import { PRICE_PROVIDER, PriceProvider, Quote } from './price-provider';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

@Injectable()
export class PricesService {
  constructor(
    @InjectModel(PriceQuote.name) private readonly quoteModel: Model<PriceQuoteDocument>,
    @Inject(PRICE_PROVIDER) private readonly provider: PriceProvider,
  ) {}

  /** Return a quote, using the cached value when it is still fresh. */
  async getQuote(symbol: string): Promise<Quote | null> {
    const upper = symbol.toUpperCase().trim();
    const cached = await this.quoteModel.findOne({ symbol: upper }).exec();
    if (cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS) {
      return { symbol: cached.symbol, price: cached.price, currency: cached.currency };
    }

    const fresh = await this.provider.getQuote(upper);
    if (!fresh)
      return cached
        ? { symbol: cached.symbol, price: cached.price, currency: cached.currency }
        : null;

    await this.quoteModel
      .updateOne(
        { symbol: upper },
        { $set: { price: fresh.price, currency: fresh.currency, fetchedAt: new Date() } },
        { upsert: true },
      )
      .exec();
    return fresh;
  }
}
