import { RulesEngine } from './rules-engine';
import { AdvisorContext } from './advisor.types';
import { AssetCategory, InvestmentType, RiskLevel } from '../../common/enums';

const inv = (over: Partial<any> = {}): any => ({
  type: InvestmentType.MUTUAL_FUND,
  investedAmount: 1000,
  currentValue: 1000,
  riskLevel: RiskLevel.MEDIUM,
  ...over,
});
const loan = (over: Partial<any> = {}): any => ({
  interestRate: 0,
  outstanding: 0,
  name: 'Loan',
  ...over,
});

const ctx = (over: Partial<AdvisorContext> = {}): AdvisorContext => ({
  investments: [],
  assets: [],
  loans: [],
  netWorth: {
    totalInvestments: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    totalAssetsWithInvestments: 0,
    netWorth: 0,
  },
  currency: 'INR',
  ...over,
});

const codes = (signals: { code: string }[]) => signals.map((s) => s.code);

describe('RulesEngine', () => {
  const engine = new RulesEngine();

  it('returns an all-clear signal when there is no data', () => {
    const signals = engine.generate(ctx());
    expect(codes(signals)).toEqual(['all_clear']);
  });

  it('flags a portfolio that is down more than 10%', () => {
    const signals = engine.generate(
      ctx({ investments: [inv({ investedAmount: 1000, currentValue: 850 })] }),
    );
    expect(codes(signals)).toContain('portfolio_down');
  });

  it('celebrates a portfolio that is up more than 15%', () => {
    const signals = engine.generate(
      ctx({ investments: [inv({ investedAmount: 1000, currentValue: 1200 })] }),
    );
    expect(codes(signals)).toContain('portfolio_up');
  });

  it('flags high-risk concentration above 60%', () => {
    const signals = engine.generate(
      ctx({
        investments: [
          inv({ riskLevel: RiskLevel.HIGH, investedAmount: 8000, currentValue: 8000 }),
          inv({ riskLevel: RiskLevel.LOW, investedAmount: 2000, currentValue: 2000 }),
        ],
      }),
    );
    expect(codes(signals)).toContain('high_risk_concentration');
  });

  it('suggests diversifying when all holdings are the same type', () => {
    const signals = engine.generate(
      ctx({
        investments: [
          inv({ investedAmount: 1000, currentValue: 1050 }),
          inv({ investedAmount: 1000, currentValue: 1050 }),
        ],
      }),
    );
    expect(codes(signals)).toContain('low_diversification');
  });

  it('suggests building an emergency fund when there is no savings balance', () => {
    const signals = engine.generate(
      ctx({ investments: [inv({ investedAmount: 1000, currentValue: 1000 })] }),
    );
    expect(codes(signals)).toContain('no_emergency_fund');
  });

  it('suggests investing idle cash', () => {
    const signals = engine.generate(
      ctx({
        investments: [inv({ investedAmount: 50000, currentValue: 50000 })],
        assets: [{ category: AssetCategory.SAVINGS_ACCOUNT, currentValue: 200000 } as any],
      }),
    );
    expect(codes(signals)).toContain('idle_cash');
  });

  it('flags a high-interest loan', () => {
    const signals = engine.generate(
      ctx({ loans: [loan({ name: 'Card', interestRate: 42, outstanding: 50000 })] }),
    );
    expect(codes(signals)).toContain('high_interest_loan');
  });

  it('flags an upcoming maturity within 30 days', () => {
    const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const signals = engine.generate(
      ctx({
        investments: [
          inv({ investedAmount: 1000, currentValue: 1050, name: 'FD', maturityDate: soon }),
        ],
      }),
    );
    expect(codes(signals)).toContain('maturity_soon');
  });

  it('flags negative net worth as critical', () => {
    const signals = engine.generate(
      ctx({
        netWorth: {
          totalInvestments: 0,
          totalAssets: 1000,
          totalLiabilities: 5000,
          totalAssetsWithInvestments: 1000,
          netWorth: -4000,
        },
      }),
    );
    expect(codes(signals)).toContain('negative_net_worth');
  });

  it('flags overdue tasks', () => {
    const signals = engine.generate(ctx({ overdueTaskCount: 3 }));
    expect(codes(signals)).toContain('overdue_tasks');
  });

  it('tolerates a high-risk holding with no current value', () => {
    const signals = engine.generate(
      ctx({
        investments: [
          inv({ riskLevel: RiskLevel.HIGH, currentValue: undefined, investedAmount: 0 }),
          inv({ riskLevel: RiskLevel.LOW, currentValue: 5000, investedAmount: 5000 }),
        ],
      }),
    );
    expect(codes(signals)).not.toContain('high_risk_concentration');
  });

  it('ignores a high-interest loan with nothing outstanding', () => {
    const signals = engine.generate(
      ctx({ loans: [loan({ name: 'Paid', interestRate: 12, outstanding: undefined })] }),
    );
    expect(codes(signals)).not.toContain('high_interest_loan');
  });

  it('tolerates missing numeric fields', () => {
    const signals = engine.generate(
      ctx({
        investments: [{ type: InvestmentType.GOLD } as any],
        assets: [{ category: AssetCategory.SAVINGS_ACCOUNT } as any],
        loans: [{ name: 'L' } as any],
      }),
    );
    // No crash; with no liquid savings tracked it nudges an emergency fund.
    expect(codes(signals)).toContain('no_emergency_fund');
  });
});
