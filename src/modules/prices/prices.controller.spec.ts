import { NotFoundException } from '@nestjs/common';
import { PricesController } from './prices.controller';

describe('PricesController', () => {
  let svc: any;
  let controller: PricesController;

  beforeEach(() => {
    svc = { getQuote: jest.fn() };
    controller = new PricesController(svc);
  });

  it('returns a quote when available', async () => {
    svc.getQuote.mockResolvedValue({ symbol: 'BTC', price: 1, currency: 'INR' });
    await expect(controller.get('btc')).resolves.toEqual({
      symbol: 'BTC',
      price: 1,
      currency: 'INR',
    });
  });

  it('throws NotFound when no quote is available', async () => {
    svc.getQuote.mockResolvedValue(null);
    await expect(controller.get('xyz')).rejects.toThrow(NotFoundException);
  });
});
