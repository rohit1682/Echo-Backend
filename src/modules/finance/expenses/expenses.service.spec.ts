import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ExpensesService } from './expenses.service';

const USER = new Types.ObjectId().toHexString();
const CAT = new Types.ObjectId().toHexString();
const TAG = new Types.ObjectId().toHexString();

describe('ExpensesService', () => {
  let model: any;
  let service: ExpensesService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    service = new ExpensesService(model);
  });

  it('create maps userId, categoryId and tags', async () => {
    model.create.mockResolvedValue({ id: 'e1' });
    await service.create(USER, { amount: 100, categoryId: CAT, tags: [TAG] } as any);
    const arg = model.create.mock.calls[0][0];
    expect(arg.userId).toBeInstanceOf(Types.ObjectId);
    expect(arg.categoryId).toBeInstanceOf(Types.ObjectId);
    expect(arg.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('create defaults tags and leaves categoryId undefined', async () => {
    model.create.mockResolvedValue({ id: 'e1' });
    await service.create(USER, { amount: 50 } as any);
    const arg = model.create.mock.calls[0][0];
    expect(arg.tags).toEqual([]);
    expect(arg.categoryId).toBeUndefined();
  });

  it('list returns populated expenses newest first', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['e']),
    });
    await expect(service.list(USER)).resolves.toEqual(['e']);
  });

  it('update maps categoryId and tags when provided', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'e1' }) });
    await service.update(USER, 'e1', { categoryId: CAT, tags: [TAG] });
    const set = model.findOneAndUpdate.mock.calls[0][1].$set;
    expect(set.categoryId).toBeInstanceOf(Types.ObjectId);
    expect(set.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('update without categoryId/tags', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'e1' }) });
    await service.update(USER, 'e1', { amount: 10 });
    const set = model.findOneAndUpdate.mock.calls[0][1].$set;
    expect(set.categoryId).toBeUndefined();
    expect(set.tags).toBeUndefined();
  });

  it('update throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update(USER, 'e1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove handles found and missing', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 'e1')).resolves.toBeUndefined();
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 'e1')).rejects.toThrow(NotFoundException);
  });

  it('findSince queries by user and date', async () => {
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(['e']) });
    await expect(service.findSince(USER, new Date())).resolves.toEqual(['e']);
    expect(model.find.mock.calls[0][0].spentAt.$gte).toBeInstanceOf(Date);
  });
});
