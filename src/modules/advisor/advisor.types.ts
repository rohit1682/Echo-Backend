import { RecommendationDomain, RecommendationSeverity } from '../../common/enums';
import { InvestmentDocument } from '../finance/investments/schemas/investment.schema';
import { AssetDocument } from '../finance/assets/schemas/asset.schema';
import { LoanDocument } from '../finance/loans/schemas/loan.schema';
import { NetWorthBreakdown } from '../finance/networth/networth.service';

/** A single deterministic finding produced by the rules engine. */
export interface Signal {
  code: string;
  domain: RecommendationDomain;
  severity: RecommendationSeverity;
  title: string;
  /** Templated, human-readable message (the free fallback for the LLM layer). */
  message: string;
  /** Structured facts passed to the LLM to ground its natural-language advice. */
  facts?: Record<string, unknown>;
}

/** All the user data the rules engine and LLM reason over. */
export interface AdvisorContext {
  investments: InvestmentDocument[];
  assets: AssetDocument[];
  loans: LoanDocument[];
  netWorth: NetWorthBreakdown;
  currency: string;
  /** Reserved for activity-domain rules (tasks/events) added in later phases. */
  overdueTaskCount?: number;
  upcomingEventCount?: number;
}

/** The recommendation shape returned to the client. */
export interface Recommendation {
  domain: RecommendationDomain;
  severity: RecommendationSeverity;
  title: string;
  message: string;
  code?: string;
  source: 'rules' | 'llm';
}
