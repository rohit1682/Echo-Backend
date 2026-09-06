import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RulesEngine } from './rules-engine';
import { LlmAdvisor } from './llm-advisor';
import { AdvisorContext, Recommendation, Signal } from './advisor.types';
import {
  Recommendation as RecommendationEntity,
  RecommendationDocument,
} from './schemas/recommendation.schema';
import { InvestmentsService } from '../finance/investments/investments.service';
import { AssetsService } from '../finance/assets/assets.service';
import { LoansService } from '../finance/loans/loans.service';
import { NetWorthService } from '../finance/networth/networth.service';

export interface AdvisorResponse {
  recommendations: Recommendation[];
  source: 'rules' | 'llm';
  llmEnabled: boolean;
  generatedAt: string;
}

@Injectable()
export class AdvisorService {
  constructor(
    @InjectModel(RecommendationEntity.name)
    private readonly recModel: Model<RecommendationDocument>,
    private readonly rules: RulesEngine,
    private readonly llm: LlmAdvisor,
    private readonly investments: InvestmentsService,
    private readonly assets: AssetsService,
    private readonly loans: LoansService,
    private readonly networth: NetWorthService,
  ) {}

  private async buildContext(userId: string): Promise<AdvisorContext> {
    const [investments, assets, loans, netWorth] = await Promise.all([
      this.investments.findAllForUser(userId),
      this.assets.findAllForUser(userId),
      this.loans.findAllForUser(userId),
      this.networth.compute(userId),
    ]);
    return { investments, assets, loans, netWorth, currency: 'INR' };
  }

  /** Generate recommendations (rules always; LLM elaboration when configured). */
  async getRecommendations(userId: string): Promise<AdvisorResponse> {
    const ctx = await this.buildContext(userId);
    const signals: Signal[] = this.rules.generate(ctx);

    let recommendations: Recommendation[] | null = null;
    let source: 'rules' | 'llm' = 'rules';

    if (this.llm.enabled) {
      const enhanced = await this.llm.enhance(signals, ctx);
      if (enhanced && enhanced.length > 0) {
        recommendations = enhanced;
        source = 'llm';
      }
    }

    if (!recommendations) {
      recommendations = signals.map<Recommendation>((s) => ({
        domain: s.domain,
        severity: s.severity,
        title: s.title,
        message: s.message,
        code: s.code,
        source: 'rules',
      }));
    }

    await this.persist(userId, recommendations);
    return {
      recommendations,
      source,
      llmEnabled: this.llm.enabled,
      generatedAt: new Date().toISOString(),
    };
  }

  private async persist(userId: string, recs: Recommendation[]): Promise<void> {
    if (recs.length === 0) return;
    const now = new Date();
    await this.recModel.insertMany(
      recs.map((r) => ({ ...r, userId: new Types.ObjectId(userId), generatedAt: now })),
      { ordered: false },
    );
  }

  history(userId: string, limit = 50): Promise<RecommendationDocument[]> {
    return this.recModel.find({ userId }).sort({ generatedAt: -1 }).limit(limit).exec();
  }
}
