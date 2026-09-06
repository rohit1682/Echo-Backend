import { Logger } from '@nestjs/common';

export const PRICE_PROVIDER = 'PRICE_PROVIDER';

export interface Quote {
  symbol: string;
  price: number;
  currency: string;
}

/**
 * Pluggable market-data source. Swap `MockPriceProvider` for a free-tier API
 * adapter (e.g. a public quote endpoint) behind this interface without touching
 * callers. Implementations should be resilient and return null on failure.
 */
export interface PriceProvider {
  getQuote(symbol: string): Promise<Quote | null>;
}

/**
 * Deterministic mock provider (free, offline). Produces a stable pseudo price per
 * symbol so the app is fully demoable without external API keys.
 */
export class MockPriceProvider implements PriceProvider {
  private readonly logger = new Logger('MockPriceProvider');

  getQuote(symbol: string): Promise<Quote | null> {
    const seed = [...symbol.toUpperCase()].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    // Base price 50–2050, with a small time-based wobble to feel "live".
    const base = 50 + (seed % 2000);
    const wobble = 1 + Math.sin(Date.now() / 8.64e7 + seed) * 0.05;
    const price = Math.round(base * wobble * 100) / 100;
    this.logger.debug(`Mock quote ${symbol} -> ${price}`);
    return Promise.resolve({ symbol: symbol.toUpperCase(), price, currency: 'INR' });
  }
}
