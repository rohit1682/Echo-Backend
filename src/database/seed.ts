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
import { AssetCategory, AuthProvider, Frequency, InvestmentType, RiskLevel } from '../common/enums';

async function seed() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  const userModel = app.get<Model<User>>(getModelToken(User.name));
  const tagModel = app.get<Model<Tag>>(getModelToken(Tag.name));
  const investmentModel = app.get<Model<Investment>>(getModelToken(Investment.name));
  const assetModel = app.get<Model<Asset>>(getModelToken(Asset.name));
  const loanModel = app.get<Model<Loan>>(getModelToken(Loan.name));

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

  await investmentModel.create([
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

  await assetModel.create([
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

  await loanModel.create([
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

  logger.log('Seed complete. Login: demo@echo.app / Password123');
  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
