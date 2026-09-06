import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let investments: any;
  let assets: any;
  let loans: any;
  let networth: any;
  let service: DashboardService;

  beforeEach(() => {
    investments = { findAllForUser: jest.fn() };
    assets = { findAllForUser: jest.fn() };
    loans = { findAllForUser: jest.fn() };
    networth = { compute: jest.fn() };
    service = new DashboardService(investments, assets, loans, networth);
  });

  it('aggregates totals and allocation with gains', async () => {
    investments.findAllForUser.mockResolvedValue([
      { type: 'mutual_fund', riskLevel: 'high', investedAmount: 100, currentValue: 120 },
      { type: 'crypto', riskLevel: 'low', investedAmount: 50, currentValue: 80 },
    ]);
    assets.findAllForUser.mockResolvedValue([{ currentValue: 10 }]);
    loans.findAllForUser.mockResolvedValue([{ outstanding: 5 }]);
    networth.compute.mockResolvedValue({
      totalAssetsWithInvestments: 210,
      totalLiabilities: 5,
      netWorth: 205,
    });

    const res = await service.getSummary('u1');
    expect(res.totals.totalInvested).toBe(150);
    expect(res.totals.totalCurrentValue).toBe(200);
    expect(res.totals.totalGain).toBe(50);
    expect(res.totals.totalGainPercent).toBeCloseTo(33.33, 1);
    expect(res.netWorth.netWorth).toBe(205);
    // Sorted by value desc; labels humanized; percents computed.
    expect(res.allocationByType[0]).toEqual(
      expect.objectContaining({
        key: 'mutual_fund',
        label: 'Mutual Fund',
        value: 120,
        percent: 60,
      }),
    );
    expect(res.allocationByRisk.map((a) => a.key)).toEqual(['high', 'low']);
    expect(res.upcoming).toEqual({ sips: [], premiums: [], commitments: [] });
  });

  it('aggregates repeated types and tolerates missing amounts', async () => {
    investments.findAllForUser.mockResolvedValue([
      {
        type: 'mutual_fund',
        riskLevel: 'high',
        investedAmount: undefined,
        currentValue: undefined,
      },
      { type: 'mutual_fund', riskLevel: 'high', investedAmount: 100, currentValue: 100 },
    ]);
    assets.findAllForUser.mockResolvedValue([]);
    loans.findAllForUser.mockResolvedValue([]);
    networth.compute.mockResolvedValue({
      totalAssetsWithInvestments: 100,
      totalLiabilities: 0,
      netWorth: 100,
    });

    const res = await service.getSummary('u1');
    expect(res.totals.totalInvested).toBe(100);
    expect(res.allocationByType).toHaveLength(1);
    expect(res.allocationByType[0]).toEqual(
      expect.objectContaining({ key: 'mutual_fund', value: 100, percent: 100 }),
    );
  });

  it('handles an empty portfolio without dividing by zero', async () => {
    investments.findAllForUser.mockResolvedValue([
      { type: 'gold', riskLevel: 'low', investedAmount: 0, currentValue: 0 },
    ]);
    assets.findAllForUser.mockResolvedValue([]);
    loans.findAllForUser.mockResolvedValue([]);
    networth.compute.mockResolvedValue({
      totalAssetsWithInvestments: 0,
      totalLiabilities: 0,
      netWorth: 0,
    });

    const res = await service.getSummary('u1');
    expect(res.totals.totalGainPercent).toBe(0);
    expect(res.allocationByType[0].percent).toBe(0);
  });
});
