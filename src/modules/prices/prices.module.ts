import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PriceQuote, PriceQuoteSchema } from './schemas/price-quote.schema';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { MockPriceProvider, PRICE_PROVIDER, PriceProvider } from './price-provider';

/**
 * Selects the market-data provider from config. Only the free `mock` provider
 * exists today; add real free-tier adapters (with their API keys) here later.
 */
const priceProviderFactory = {
  provide: PRICE_PROVIDER,
  inject: [ConfigService],
  useFactory: (_config: ConfigService): PriceProvider => {
    // const provider = _config.get<string>('prices.provider', 'mock');
    return new MockPriceProvider();
  },
};

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PriceQuote.name, schema: PriceQuoteSchema }]),
    ConfigModule,
  ],
  providers: [PricesService, priceProviderFactory],
  controllers: [PricesController],
  exports: [PricesService],
})
export class PricesModule {}
