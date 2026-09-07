import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { BudgetsService } from './budgets.service';
import { Frequency } from '../../../common/enums';

const USER = new Types.ObjectId().toHexString();
const CAT = new Types.ObjectId();

describe('BudgetsService', () => {
  let model: any;
  let expenses: any;
  let service: BudgetsService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    expenses = { findSince: jest.fn() };
    service = new BudgetsService(model, expenses);
  });

  it('create maps userId and categoryId', async () => {
    model.create.mockResolvedValue({ id: 'b1' });
    await service.create(USER, { name: 'Food', limit: 5000, categoryId: CAT.toHexString() } as any);
    const arg = model.create.mock.calls[0][0];
    expect(arg.userId).toBeInstanceOf(Types.ObjectId);
    expect(arg.categoryId).toBeInstanceOf(Types.ObjectId);
  });

  it('create without categoryId leaves it undefined', async () => {
    model.create.mockResolvedValue({ id: 'b1' });
    await service.create(USER, { name: 'All', limit: 5000 } as any);
    expect(model.create.mock.calls[0][0].categoryId).toBeUndefined();
  });

  it('list populates category', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['b']),
    });
    await expect(service.list(USER)).resolves.toEqual(['b']);
  });

  it('update maps categoryId when provided', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'b1' }) });
    await service.update(USER, 'b1', { categoryId: CAT.toHexString() });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.categoryId).toBeInstanceOf(Types.ObjectId);
  });

  it('update without categoryId', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'b1' }) });
    await service.update(USER, 'b1', { name: 'X' });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.categoryId).toBeUndefined();
  });

  it('update throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update(USER, 'b1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove handles found and missing', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 'b1')).resolves.toBeUndefined();
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 'b1')).rejects.toThrow(NotFoundException);
  });

  it('summary returns [] when there are no budgets', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    await expect(service.summary(USER)).resolves.toEqual([]);
    expect(expenses.findSince).not.toHaveBeenCalled();
  });

  it('summary computes spent, remaining and percent per budget', async () => {
    const now = new Date();
    const budgets = [
      {
        _id: 'b1',
        name: 'Food',
        categoryId: CAT,
        limit: 1000,
        period: Frequency.MONTHLY,
        currency: 'INR',
      },
      {
        _id: 'b2',
        name: 'All',
        categoryId: undefined,
        limit: 0,
        period: Frequency.MONTHLY,
        currency: 'INR',
      },
    ];
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(budgets),
    });
    expenses.findSince.mockResolvedValue([
      { amount: 300, categoryId: CAT, spentAt: now },
      { amount: 200, categoryId: new Types.ObjectId(), spentAt: now }, // different category
      { amount: 100, categoryId: CAT, spentAt: new Date('2000-01-01') }, // before window
      { categoryId: CAT, spentAt: now }, // no amount → contributes 0 (nullish fallback)
    ]);

    const res = await service.summary(USER);
    // b1 counts only the 300 (same category, in window)
    expect(res[0]).toMatchObject({ spent: 300, remaining: 700, percent: 30 });
    // b2 has no category → counts all in-window expenses (300 + 200); limit 0 → percent 0
    expect(res[1]).toMatchObject({ spent: 500, remaining: -500, percent: 0, categoryId: null });
  });

  it('periodStart handles daily, weekly, yearly and monthly default', () => {
    const now = new Date('2026-09-08T10:00:00Z');
    const start = (p: Frequency) => (service as any).periodStart(p, now) as Date;
    expect(start(Frequency.DAILY).getHours()).toBe(0);
    const weekly = start(Frequency.WEEKLY);
    expect(Math.round((now.getTime() - weekly.getTime()) / 86400000)).toBeGreaterThanOrEqual(6);
    expect(start(Frequency.YEARLY).getMonth()).toBe(0);
    expect(start(Frequency.QUARTERLY).getDate()).toBe(1); // default → start of month
  });
});
