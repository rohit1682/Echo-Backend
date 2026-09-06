import { RulesEngine } from './rules-engine';
import { AdvisorContext } from './advisor.types';
import { InvestmentType, RiskLevel } from '../../common/enums';

/** Minimal shape helpers so we don't need full Mongoose documents in tests. */
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

describe('RulesEngine', () => {
  const engine = new RulesEngine();

  it('returns an all-clear signal when there is no data', () => {
    const signals = engine.generate(ctx());
    expect(signals).toHaveLength(1);
    expect(signals[0].code).toBe('all_clear');
  });

  it('flags a portfolio that is down more than 10%', () => {
    const signals = engine.generate(
      ctx({ investments: [inv({ investedAmount: 1000, currentValue: 850 })] }),
    );
    expect(signals.some((s) => s.code === 'portfolio_down')).toBe(true);
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
    expect(signals.some((s) => s.code === 'high_risk_concentration')).toBe(true);
  });

  it('flags a high-interest loan', () => {
    const signals = engine.generate(
      ctx({ loans: [loan({ name: 'Card', interestRate: 42, outstanding: 50000 })] }),
    );
    expect(signals.some((s) => s.code === 'high_interest_loan')).toBe(true);
  });

  it('suggests building an emergency fund when there is no savings balance', () => {
    const signals = engine.generate(
      ctx({ investments: [inv({ investedAmount: 1000, currentValue: 1000 })] }),
    );
    expect(signals.some((s) => s.code === 'no_emergency_fund')).toBe(true);
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
    expect(signals.some((s) => s.code === 'negative_net_worth')).toBe(true);
  });
});
