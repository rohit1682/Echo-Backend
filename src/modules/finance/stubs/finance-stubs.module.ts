import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createStubController } from '../../../common/stub.controller';
import { Sip, SipSchema } from './schemas/sip.schema';
import { InsurancePolicy, InsurancePolicySchema } from './schemas/insurance-policy.schema';
import { PremiumPayment, PremiumPaymentSchema } from './schemas/premium-payment.schema';
import { Goal, GoalSchema } from './schemas/goal.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { FinancialCategory, FinancialCategorySchema } from './schemas/financial-category.schema';

/**
 * Registers the data models for finance features whose full CRUD is planned for
 * upcoming phases, and exposes placeholder endpoints. Replace each stub with a
 * dedicated module (schema + service + controller) as its phase is built —
 * mirror the fully-implemented `investments` / `assets` / `loans` / `expenses` /
 * `budgets` modules. `FinancialCategory` stays here (still stubbed) so its model
 * is registered on the connection for expenses/budgets to populate against.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sip.name, schema: SipSchema },
      { name: InsurancePolicy.name, schema: InsurancePolicySchema },
      { name: PremiumPayment.name, schema: PremiumPaymentSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: FinancialCategory.name, schema: FinancialCategorySchema },
    ]),
  ],
  controllers: [
    createStubController('finance/sips', 'SIP tracking'),
    createStubController('finance/insurance', 'Insurance & premiums'),
    createStubController('finance/goals', 'Savings goals'),
    createStubController('finance/subscriptions', 'Subscriptions'),
    createStubController('finance/categories', 'Financial categories'),
  ] as any,
})
export class FinanceStubsModule {}
