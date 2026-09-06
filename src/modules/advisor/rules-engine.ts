import { Injectable } from '@nestjs/common';
import { AdvisorContext, Signal } from './advisor.types';
import {
  AssetCategory,
  RecommendationDomain,
  RecommendationSeverity,
  RiskLevel,
} from '../../common/enums';

const FINANCE = RecommendationDomain.FINANCE;
const { INFO, SUGGESTION, WARNING, CRITICAL } = RecommendationSeverity;

/**
 * Deterministic, dependency-free recommendation engine. Always available (free)
 * and the ground truth the optional LLM layer elaborates on. Each rule inspects
 * the user's own data and emits zero or more Signals.
 */
@Injectable()
export class RulesEngine {
  generate(ctx: AdvisorContext): Signal[] {
    const signals: Signal[] = [];
    const cur = ctx.currency;
    const money = (n: number) => `${cur} ${Math.round(n).toLocaleString('en-IN')}`;

    const totalCurrent = ctx.investments.reduce((s, i) => s + (i.currentValue ?? 0), 0);
    const totalInvested = ctx.investments.reduce((s, i) => s + (i.investedAmount ?? 0), 0);

    // 1) Portfolio performance
    if (totalInvested > 0) {
      const gain = totalCurrent - totalInvested;
      const pct = (gain / totalInvested) * 100;
      if (pct <= -10) {
        signals.push({
          code: 'portfolio_down',
          domain: FINANCE,
          severity: WARNING,
          title: 'Your portfolio is down',
          message: `Your investments are down ${Math.abs(pct).toFixed(1)}% (${money(gain)}). Review holdings before making emotional decisions — dips can be normal for long-term assets.`,
          facts: { gain, pct },
        });
      } else if (pct >= 15) {
        signals.push({
          code: 'portfolio_up',
          domain: FINANCE,
          severity: INFO,
          title: 'Your portfolio is performing well',
          message: `You're up ${pct.toFixed(1)}% (${money(gain)}). Consider rebalancing to lock in some gains and keep your risk on target.`,
          facts: { gain, pct },
        });
      }
    }

    // 2) Risk concentration
    if (totalCurrent > 0) {
      const highRisk = ctx.investments
        .filter((i) => i.riskLevel === RiskLevel.HIGH)
        .reduce((s, i) => s + (i.currentValue ?? 0), 0);
      const highPct = (highRisk / totalCurrent) * 100;
      if (highPct >= 60) {
        signals.push({
          code: 'high_risk_concentration',
          domain: FINANCE,
          severity: WARNING,
          title: 'High-risk concentration',
          message: `${highPct.toFixed(0)}% of your portfolio is in high-risk assets. Consider shifting some into lower-risk instruments to cushion volatility.`,
          facts: { highPct },
        });
      }
    }

    // 3) Diversification
    const types = new Set(ctx.investments.map((i) => i.type));
    if (ctx.investments.length >= 2 && types.size === 1) {
      signals.push({
        code: 'low_diversification',
        domain: FINANCE,
        severity: SUGGESTION,
        title: 'Diversify your investments',
        message: `All your investments are the same type. Spreading across asset classes (equity, debt, gold) can reduce risk.`,
        facts: { typeCount: types.size },
      });
    }

    // 4) Emergency fund — only nudge users who are already tracking finances.
    const hasFinancialData = ctx.investments.length > 0 || ctx.assets.length > 0;
    const liquid = ctx.assets
      .filter((a) => a.category === AssetCategory.SAVINGS_ACCOUNT)
      .reduce((s, a) => s + (a.currentValue ?? 0), 0);
    if (hasFinancialData && liquid === 0) {
      signals.push({
        code: 'no_emergency_fund',
        domain: FINANCE,
        severity: SUGGESTION,
        title: 'Build an emergency fund',
        message: `You have no savings-account balance tracked. Aim for 3–6 months of expenses in an easily accessible account before locking money into long-term investments.`,
      });
    } else if (liquid > totalCurrent && totalCurrent >= 0 && liquid > 100000) {
      signals.push({
        code: 'idle_cash',
        domain: FINANCE,
        severity: SUGGESTION,
        title: 'Put idle cash to work',
        message: `You're holding ${money(liquid)} in savings — more than you have invested. Beyond your emergency buffer, consider investing the surplus so inflation doesn't erode it.`,
        facts: { liquid },
      });
    }

    // 5) High-interest debt
    const costlyLoans = ctx.loans.filter(
      (l) => (l.interestRate ?? 0) >= 10 && (l.outstanding ?? 0) > 0,
    );
    for (const loan of costlyLoans) {
      signals.push({
        code: 'high_interest_loan',
        domain: FINANCE,
        severity: WARNING,
        title: `High-interest loan: ${loan.name}`,
        message: `"${loan.name}" charges ${loan.interestRate}% with ${money(loan.outstanding)} outstanding. Prioritising extra repayments here usually beats the returns on most investments.`,
        facts: { interestRate: loan.interestRate, outstanding: loan.outstanding },
      });
    }

    // 6) Maturities coming up (next 30 days)
    const soon = Date.now() + 30 * 24 * 60 * 60 * 1000;
    for (const inv of ctx.investments) {
      if (
        inv.maturityDate &&
        inv.maturityDate.getTime() <= soon &&
        inv.maturityDate.getTime() >= Date.now()
      ) {
        signals.push({
          code: 'maturity_soon',
          domain: FINANCE,
          severity: INFO,
          title: `${inv.name} matures soon`,
          message: `"${inv.name}" matures on ${inv.maturityDate.toDateString()}. Plan whether to reinvest or withdraw the proceeds.`,
          facts: { maturityDate: inv.maturityDate },
        });
      }
    }

    // 7) Net worth snapshot
    if (ctx.netWorth.netWorth < 0) {
      signals.push({
        code: 'negative_net_worth',
        domain: FINANCE,
        severity: CRITICAL,
        title: 'Liabilities exceed assets',
        message: `Your liabilities (${money(ctx.netWorth.totalLiabilities)}) currently exceed your assets. Focus on reducing high-interest debt and avoid taking on new loans.`,
      });
    }

    // 8) Activity signals (data arrives in later phases)
    if ((ctx.overdueTaskCount ?? 0) > 0) {
      signals.push({
        code: 'overdue_tasks',
        domain: RecommendationDomain.ACTIVITY,
        severity: WARNING,
        title: 'You have overdue tasks',
        message: `You have ${ctx.overdueTaskCount} overdue task(s). Clearing them keeps small commitments from piling up.`,
        facts: { overdueTaskCount: ctx.overdueTaskCount },
      });
    }

    // Nothing to flag → a friendly all-clear.
    if (signals.length === 0) {
      signals.push({
        code: 'all_clear',
        domain: RecommendationDomain.GENERAL,
        severity: INFO,
        title: "You're on track",
        message: `Nothing needs your attention right now. Keep adding your finances and activities so Echo can give sharper, more personal guidance.`,
      });
    }

    return signals;
  }
}
