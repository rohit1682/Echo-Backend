/**
 * Seed script: creates a demo user with sample finance data so the app is
 * immediately explorable. Idempotent — it wipes and recreates the demo user.
 *
 *   npm run seed
 *
 * Demo login:  demo@echo.app  /  Password123
 */
import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';

import { AppModule } from '../app.module';
import { User } from '../modules/users/schemas/user.schema';
import { Tag } from '../modules/tags/schemas/tag.schema';
import { Investment } from '../modules/finance/investments/schemas/investment.schema';
import { Asset } from '../modules/finance/assets/schemas/asset.schema';
import { Loan } from '../modules/finance/loans/schemas/loan.schema';
import { NetWorthSnapshot } from '../modules/finance/networth/schemas/networth-snapshot.schema';
import { Expense } from '../modules/finance/stubs/schemas/expense.schema';
import { Budget } from '../modules/finance/stubs/schemas/budget.schema';
import { Task } from '../modules/activity/schemas/task.schema';
import {
  AssetCategory,
  AuthProvider,
  Frequency,
  InvestmentType,
  RiskLevel,
  TaskPriority,
} from '../common/enums';

async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const tagModel = app.get<Model<Tag>>(getModelToken(Tag.name));
  const investmentModel = app.get<Model<Investment>>(getModelToken(Investment.name));
  const assetModel = app.get<Model<Asset>>(getModelToken(Asset.name));
  const loanModel = app.get<Model<Loan>>(getModelToken(Loan.name));
  const snapshotModel = app.get<Model<NetWorthSnapshot>>(getModelToken(NetWorthSnapshot.name));
  const expenseModel = app.get<Model<Expense>>(getModelToken(Expense.name));
  const budgetModel = app.get<Model<Budget>>(getModelToken(Budget.name));
  const taskModel = app.get<Model<Task>>(getModelToken(Task.name));

  const email = 'demo@echo.app';

  // Clean up any previous demo data.
  const existing = await userModel.findOne({ email }).exec();
  if (existing) {
    const uid = existing._id;
    await Promise.all([
      investmentModel.deleteMany({ userId: uid }),
      assetModel.deleteMany({ userId: uid }),
      loanModel.deleteMany({ userId: uid }),
      tagModel.deleteMany({ userId: uid }),
      snapshotModel.deleteMany({ userId: uid }),
      expenseModel.deleteMany({ userId: uid }),
      budgetModel.deleteMany({ userId: uid }),
      taskModel.deleteMany({ userId: uid }),
    ]);
    await userModel.deleteOne({ _id: uid });
    logger.log('Removed existing demo data');
  }

  const passwordHash = await bcrypt.hash('Password123', 12);
  const user = await userModel.create({
    email,
    name: 'Demo User',
    passwordHash,
    emailVerified: true,
    authProviders: [{ provider: AuthProvider.PASSWORD, providerId: email }],
  });
  const userId = user._id;
  logger.log(`Created demo user ${email}`);

  const [retirement, longTerm, emergency, highRisk] = await tagModel.create([
    { userId, name: 'Retirement', color: '#8b5cf6' },
    { userId, name: 'Long Term', color: '#06b6d4' },
    { userId, name: 'Emergency Fund', color: '#22c55e' },
    { userId, name: 'High Risk', color: '#ef4444' },
  ]);

  const investments = await investmentModel.create([
    {
      userId,
      name: 'Nifty 50 Index Fund',
      type: InvestmentType.MUTUAL_FUND,
      investedAmount: 200000,
      currentValue: 246500,
      riskLevel: RiskLevel.MEDIUM,
      investmentDate: new Date('2022-04-01'),
      frequency: Frequency.MONTHLY,
      symbol: 'NIFTY50',
      tags: [longTerm._id, retirement._id],
    },
    {
      userId,
      name: 'Bluechip Equity Fund',
      type: InvestmentType.MUTUAL_FUND,
      investedAmount: 150000,
      currentValue: 141000,
      riskLevel: RiskLevel.HIGH,
      investmentDate: new Date('2023-01-15'),
      tags: [highRisk._id],
    },
    {
      userId,
      name: 'Bitcoin',
      type: InvestmentType.CRYPTO,
      investedAmount: 100000,
      currentValue: 168000,
      riskLevel: RiskLevel.HIGH,
      investmentDate: new Date('2023-06-10'),
      symbol: 'BTC',
      tags: [highRisk._id],
    },
    {
      userId,
      name: 'SBI Tax Saver PPF',
      type: InvestmentType.PPF,
      investedAmount: 250000,
      currentValue: 268000,
      riskLevel: RiskLevel.LOW,
      investmentDate: new Date('2020-04-01'),
      maturityDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      tags: [retirement._id],
    },
    {
      userId,
      name: 'Sovereign Gold Bond',
      type: InvestmentType.GOLD,
      investedAmount: 120000,
      currentValue: 139000,
      riskLevel: RiskLevel.LOW,
      investmentDate: new Date('2021-08-01'),
      tags: [longTerm._id],
    },
  ]);

  const assets = await assetModel.create([
    {
      userId,
      name: 'HDFC Savings Account',
      category: AssetCategory.SAVINGS_ACCOUNT,
      currentValue: 350000,
      tags: [emergency._id],
    },
    {
      userId,
      name: 'Honda City',
      category: AssetCategory.VEHICLE,
      currentValue: 750000,
      purchaseValue: 1200000,
      acquiredDate: new Date('2021-03-01'),
    },
  ]);

  const loans = await loanModel.create([
    {
      userId,
      name: 'Home Loan',
      lender: 'HDFC',
      principal: 4000000,
      outstanding: 2850000,
      interestRate: 8.6,
      emiAmount: 34500,
      tenureMonths: 240,
      startDate: new Date('2021-03-01'),
      nextDueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    },
    {
      userId,
      name: 'Credit Card Balance',
      lender: 'ICICI',
      principal: 85000,
      outstanding: 85000,
      interestRate: 42,
      emiAmount: 8500,
    },
  ]);

  // Net-worth history so the trend chart has real data to draw.
  const currentAssets =
    investments.reduce((s, i) => s + (i.currentValue ?? 0), 0) +
    assets.reduce((s, a) => s + (a.currentValue ?? 0), 0);
  const currentLiabilities = loans.reduce((s, l) => s + (l.outstanding ?? 0), 0);
  const currentNetWorth = currentAssets - currentLiabilities;

  const MONTHS = 12;
  // A year ago net worth was lower (fewer gains, larger loan balances); trend upward to today.
  const startNetWorth = currentNetWorth - 520000;
  const snapshots = Array.from({ length: MONTHS }, (_, i) => {
    const t = i / (MONTHS - 1);
    const base = startNetWorth + (currentNetWorth - startNetWorth) * t;
    // A little organic wobble on the intermediate points; land exactly on today's value.
    const noise = i === MONTHS - 1 ? 0 : Math.round(Math.sin(i * 1.7) * 45000);
    const liabilities = Math.round(currentLiabilities + (MONTHS - 1 - i) * 12000);
    const netWorth = Math.round(base) + noise;
    const capturedAt = new Date();
    capturedAt.setMonth(capturedAt.getMonth() - (MONTHS - 1 - i));
    return {
      userId,
      totalAssets: netWorth + liabilities,
      totalLiabilities: liabilities,
      netWorth,
      capturedAt,
    };
  });
  await snapshotModel.create(snapshots);
  logger.log(`Created ${MONTHS} net-worth snapshots`);

  // A monthly budget and some expenses within the current month.
  await budgetModel.create([
    { userId, name: 'Monthly spending', limit: 45000, period: Frequency.MONTHLY, currency: 'INR' },
  ]);
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const daysIntoMonth = Math.max(1, Math.floor((Date.now() - monthStart.getTime()) / 86400000));
  const expenseSeed = [
    { amount: 4200, description: 'Groceries' },
    { amount: 1800, description: 'Dining out' },
    { amount: 2500, description: 'Fuel' },
    { amount: 999, description: 'Streaming subscriptions' },
    { amount: 6500, description: 'Electricity bill' },
    { amount: 3200, description: 'Pharmacy' },
  ];
  await expenseModel.create(
    expenseSeed.map((e, i) => ({
      userId,
      amount: e.amount,
      description: e.description,
      currency: 'INR',
      spentAt: new Date(monthStart.getTime() + Math.min(daysIntoMonth - 1, i * 3) * 86400000),
    })),
  );
  logger.log(`Created ${expenseSeed.length} expenses + 1 budget`);

  // Personal Activity tasks (some with due dates so the calendar has markers).
  const day = 24 * 60 * 60 * 1000;
  await taskModel.create([
    {
      userId,
      title: 'Pay home loan EMI',
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 12 * day),
      recurrence: Frequency.MONTHLY,
    },
    {
      userId,
      title: 'Review investment portfolio',
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 3 * day),
    },
    {
      userId,
      title: 'Renew car insurance',
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 20 * day),
    },
    {
      userId,
      title: 'Buy groceries',
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 1 * day),
    },
    {
      userId,
      title: 'Call financial advisor',
      priority: TaskPriority.MEDIUM,
      completed: true,
      completedAt: new Date(Date.now() - 2 * day),
    },
  ]);
  logger.log('Created 5 tasks');

  logger.log('Seed complete. Login: demo@echo.app / Password123');
  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
