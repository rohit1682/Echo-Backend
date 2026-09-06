import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createStubController } from '../../../common/stub.controller';
import { Sip, SipSchema } from './schemas/sip.schema';
import { InsurancePolicy, InsurancePolicySchema } from './schemas/insurance-policy.schema';
import { PremiumPayment, PremiumPaymentSchema } from './schemas/premium-payment.schema';
import { Goal, GoalSchema } from './schemas/goal.schema';
import { Budget, BudgetSchema } from './schemas/budget.schema';
import { Expense, ExpenseSchema } from './schemas/expense.schema';
import { Subscription, SubscriptionSchema } from './schemas/subscription.schema';
import { FinancialCategory, FinancialCategorySchema } from './schemas/financial-category.schema';

/**
 * Registers the data models for finance features whose full CRUD is planned for
 * upcoming phases, and exposes placeholder endpoints. Replace each stub with a
 * dedicated module (schema + service + controller) as its phase is built —
 * mirror the fully-implemented `investments` / `assets` / `loans` modules.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sip.name, schema: SipSchema },
      { name: InsurancePolicy.name, schema: InsurancePolicySchema },
      { name: PremiumPayment.name, schema: PremiumPaymentSchema },
      { name: Goal.name, schema: GoalSchema },
      { name: Budget.name, schema: BudgetSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: FinancialCategory.name, schema: FinancialCategorySchema },
    ]),
  ],
  controllers: [
    createStubController('finance/sips', 'SIP tracking'),
    createStubController('finance/insurance', 'Insurance & premiums'),
    createStubController('finance/goals', 'Savings goals'),
    createStubController('finance/budgets', 'Budgets'),
    createStubController('finance/expenses', 'Expense tracking'),
    createStubController('finance/subscriptions', 'Subscriptions'),
    createStubController('finance/categories', 'Financial categories'),
  ] as any,
})
export class FinanceStubsModule {}
