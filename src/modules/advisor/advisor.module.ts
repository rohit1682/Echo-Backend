import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Recommendation, RecommendationSchema } from './schemas/recommendation.schema';
import { AdvisorService } from './advisor.service';
import { AdvisorController } from './advisor.controller';
import { RulesEngine } from './rules-engine';
import { LlmAdvisor } from './llm-advisor';
import { InvestmentsModule } from '../finance/investments/investments.module';
import { AssetsModule } from '../finance/assets/assets.module';
import { LoansModule } from '../finance/loans/loans.module';
import { NetWorthModule } from '../finance/networth/networth.module';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Recommendation.name, schema: RecommendationSchema }]),
    InvestmentsModule,
    AssetsModule,
    LoansModule,
    NetWorthModule,
  ],
  providers: [AdvisorService, RulesEngine, LlmAdvisor],
  controllers: [AdvisorController],
  exports: [AdvisorService],
})
export class AdvisorModule {}
