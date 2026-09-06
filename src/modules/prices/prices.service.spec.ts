import { PricesService } from './prices.service';

function cached(fetchedAt: Date) {
  return { symbol: 'BTC', price: 100, currency: 'INR', fetchedAt };
}

describe('PricesService', () => {
  let model: any;
  let provider: any;
  let service: PricesService;

  beforeEach(() => {
    model = {
      findOne: jest.fn(),
      updateOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };
    provider = { getQuote: jest.fn() };
    service = new PricesService(model, provider);
  });

  it('returns a fresh cache hit without calling the provider', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(cached(new Date())) });
    const res = await service.getQuote('btc');
    expect(res).toEqual({ symbol: 'BTC', price: 100, currency: 'INR' });
    expect(provider.getQuote).not.toHaveBeenCalled();
  });

  it('refreshes a stale cache from the provider and upserts', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cached(new Date(Date.now() - 60 * 60 * 1000))),
    });
    provider.getQuote.mockResolvedValue({ symbol: 'BTC', price: 200, currency: 'INR' });
    const res = await service.getQuote('btc');
    expect(res).toEqual({ symbol: 'BTC', price: 200, currency: 'INR' });
    expect(model.updateOne).toHaveBeenCalled();
  });

  it('fetches when there is no cache', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    provider.getQuote.mockResolvedValue({ symbol: 'ETH', price: 5, currency: 'INR' });
    const res = await service.getQuote('eth');
    expect(res).toEqual({ symbol: 'ETH', price: 5, currency: 'INR' });
  });

  it('falls back to a stale cache when the provider fails', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cached(new Date(Date.now() - 60 * 60 * 1000))),
    });
    provider.getQuote.mockResolvedValue(null);
    const res = await service.getQuote('btc');
    expect(res).toEqual({ symbol: 'BTC', price: 100, currency: 'INR' });
  });

  it('returns null when there is no cache and the provider fails', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    provider.getQuote.mockResolvedValue(null);
    await expect(service.getQuote('xyz')).resolves.toBeNull();
  });
});
