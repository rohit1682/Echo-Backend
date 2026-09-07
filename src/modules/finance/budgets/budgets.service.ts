import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Budget, BudgetDocument } from '../stubs/schemas/budget.schema';
import { CreateBudgetDto, UpdateBudgetDto } from './dto/budget.dto';
import { ExpensesService } from '../expenses/expenses.service';
import { Frequency } from '../../../common/enums';

export interface BudgetSummary {
  _id: string;
  name: string;
  categoryId: string | null;
  limit: number;
  period: Frequency;
  currency: string;
  spent: number;
  remaining: number;
  percent: number;
}

@Injectable()
export class BudgetsService {
  constructor(
    @InjectModel(Budget.name) private readonly model: Model<BudgetDocument>,
    private readonly expenses: ExpensesService,
  ) {}

  create(userId: string, dto: CreateBudgetDto): Promise<BudgetDocument> {
    return this.model.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      categoryId: dto.categoryId ? new Types.ObjectId(dto.categoryId) : undefined,
    });
  }

  list(userId: string): Promise<BudgetDocument[]> {
    return this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('categoryId')
      .exec();
  }

  async update(userId: string, id: string, dto: UpdateBudgetDto): Promise<BudgetDocument> {
    const update: Record<string, any> = { ...dto };
    if (dto.categoryId) update.categoryId = new Types.ObjectId(dto.categoryId);
    const doc = await this.model
      .findOneAndUpdate(
        { _id: id, userId: new Types.ObjectId(userId) },
        { $set: update },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Budget not found');
    return doc;
  }

  async remove(userId: string, id: string): Promise<void> {
    const res = await this.model.deleteOne({ _id: id, userId: new Types.ObjectId(userId) }).exec();
    if (res.deletedCount === 0) throw new NotFoundException('Budget not found');
  }

  /** Start of the current period window for a budget frequency. */
  private periodStart(period: Frequency, now: Date): Date {
    switch (period) {
      case Frequency.DAILY: {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        return d;
      }
      case Frequency.WEEKLY: {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - 6);
        return d;
      }
      case Frequency.YEARLY:
        return new Date(now.getFullYear(), 0, 1);
      default:
        // Monthly (and any coarser/custom period) → start of the current month.
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  /** Each budget with how much has been spent against it in the current period. */
  async summary(userId: string): Promise<BudgetSummary[]> {
    const budgets = await this.model
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
    if (budgets.length === 0) return [];

    const now = new Date();
    const starts = budgets.map((b) => this.periodStart(b.period, now));
    const earliest = new Date(Math.min(...starts.map((d) => d.getTime())));
    const expenses = await this.expenses.findSince(userId, earliest);

    return budgets.map((b, i) => {
      const start = starts[i];
      const spent = expenses
        .filter((e) => e.spentAt >= start)
        .filter((e) => !b.categoryId || String(e.categoryId) === String(b.categoryId))
        .reduce((sum, e) => sum + (e.amount ?? 0), 0);
      const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        _id: String(b._id),
        name: b.name,
        categoryId: b.categoryId ? String(b.categoryId) : null,
        limit: b.limit,
        period: b.period,
        currency: b.currency,
        spent,
        remaining: b.limit - spent,
        percent,
      };
    });
  }
}
