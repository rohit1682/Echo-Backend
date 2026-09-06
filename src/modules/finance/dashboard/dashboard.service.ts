import { Injectable } from '@nestjs/common';
import { InvestmentsService } from '../investments/investments.service';
import { AssetsService } from '../assets/assets.service';
import { LoansService } from '../loans/loans.service';
import { NetWorthService } from '../networth/networth.service';

export interface AllocationSlice {
  key: string;
  label: string;
  value: number;
  percent: number;
}

export interface DashboardSummary {
  totals: {
    totalInvested: number;
    totalCurrentValue: number;
    totalGain: number;
    totalGainPercent: number;
    investmentCount: number;
    assetCount: number;
    loanCount: number;
  };
  netWorth: {
    totalAssets: number;
    totalLiabilities: number;
    netWorth: number;
  };
  allocationByType: AllocationSlice[];
  allocationByRisk: AllocationSlice[];
  upcoming: {
    sips: unknown[];
    premiums: unknown[];
    commitments: unknown[];
  };
  currency: string;
}

const humanize = (key: string): string =>
  key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

@Injectable()
export class DashboardService {
  constructor(
    private readonly investments: InvestmentsService,
    private readonly assets: AssetsService,
    private readonly loans: LoansService,
    private readonly networth: NetWorthService,
  ) {}

  async getSummary(userId: string): Promise<DashboardSummary> {
    const [invs, assets, loans, nw] = await Promise.all([
      this.investments.findAllForUser(userId),
      this.assets.findAllForUser(userId),
      this.loans.findAllForUser(userId),
      this.networth.compute(userId),
    ]);

    const totalInvested = invs.reduce((s, i) => s + (i.investedAmount ?? 0), 0);
    const totalCurrentValue = invs.reduce((s, i) => s + (i.currentValue ?? 0), 0);
    const totalGain = totalCurrentValue - totalInvested;

    return {
      totals: {
        totalInvested,
        totalCurrentValue,
        totalGain,
        totalGainPercent: totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0,
        investmentCount: invs.length,
        assetCount: assets.length,
        loanCount: loans.length,
      },
      netWorth: {
        totalAssets: nw.totalAssetsWithInvestments,
        totalLiabilities: nw.totalLiabilities,
        netWorth: nw.netWorth,
      },
      allocationByType: this.allocate(invs, (i) => i.type),
      allocationByRisk: this.allocate(invs, (i) => i.riskLevel),
      // Filled in once the SIP/insurance/commitment modules land.
      upcoming: { sips: [], premiums: [], commitments: [] },
      currency: 'INR',
    };
  }

  private allocate<T extends { currentValue: number }>(
    items: T[],
    keyFn: (item: T) => string,
  ): AllocationSlice[] {
    const totals = new Map<string, number>();
    let grand = 0;
    for (const item of items) {
      const key = keyFn(item);
      const value = item.currentValue ?? 0;
      totals.set(key, (totals.get(key) ?? 0) + value);
      grand += value;
    }
    return [...totals.entries()]
      .map(([key, value]) => ({
        key,
        label: humanize(key),
        value,
        percent: grand > 0 ? (value / grand) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }
}
