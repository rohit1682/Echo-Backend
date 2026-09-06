import { MockPriceProvider } from './price-provider';

describe('MockPriceProvider', () => {
  it('returns a deterministic quote with an uppercase symbol', async () => {
    const provider = new MockPriceProvider();
    jest.spyOn((provider as any).logger, 'debug').mockImplementation(() => undefined);
    const quote = await provider.getQuote('btc');
    expect(quote).not.toBeNull();
    expect(quote!.symbol).toBe('BTC');
    expect(quote!.currency).toBe('INR');
    expect(quote!.price).toBeGreaterThan(0);
  });
});
