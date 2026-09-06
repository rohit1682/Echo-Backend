import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { PricesService } from './prices.service';

@Controller('prices')
export class PricesController {
  constructor(private readonly prices: PricesService) {}

  /** Fetch (and cache) the latest quote for a symbol. */
  @Get(':symbol')
  async get(@Param('symbol') symbol: string) {
    const quote = await this.prices.getQuote(symbol);
    if (!quote) throw new NotFoundException(`No quote available for ${symbol}`);
    return quote;
  }
}
