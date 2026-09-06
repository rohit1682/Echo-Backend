import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { InvestmentsService } from './investments.service';
import { InvestmentType } from '../../../common/enums';

const USER = new Types.ObjectId().toHexString();
const TAG = new Types.ObjectId().toHexString();

function findChain(result: unknown) {
  const c: any = {};
  ['sort', 'skip', 'limit', 'populate'].forEach((m) => (c[m] = jest.fn().mockReturnValue(c)));
  c.exec = jest.fn().mockResolvedValue(result);
  return c;
}

describe('InvestmentsService', () => {
  let model: any;
  let service: InvestmentsService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    service = new InvestmentsService(model);
  });

  it('create maps tags to ObjectIds', async () => {
    model.create.mockResolvedValue({ id: 'i1' });
    await service.create(USER, { name: 'A', tags: [TAG] } as any);
    const arg = model.create.mock.calls[0][0];
    expect(arg.userId).toBeInstanceOf(Types.ObjectId);
    expect(arg.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('create defaults tags to an empty array', async () => {
    model.create.mockResolvedValue({ id: 'i1' });
    await service.create(USER, { name: 'A' } as any);
    expect(model.create.mock.calls[0][0].tags).toEqual([]);
  });

  it('findAll applies filters and pagination', async () => {
    model.find.mockReturnValue(findChain([{ id: 'i1' }]));
    model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(1) });
    const res = await service.findAll(USER, {
      type: InvestmentType.CRYPTO,
      tag: TAG,
      status: 'active',
      page: 2,
      limit: 10,
    } as any);
    expect(res).toEqual({ items: [{ id: 'i1' }], total: 1, page: 2, limit: 10 });
    const filter = model.find.mock.calls[0][0];
    expect(filter.type).toBe(InvestmentType.CRYPTO);
    expect(filter.status).toBe('active');
    expect(filter.tags).toBeInstanceOf(Types.ObjectId);
  });

  it('findAll uses defaults when no params are given', async () => {
    model.find.mockReturnValue(findChain([]));
    model.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });
    const res = await service.findAll(USER, {} as any);
    expect(res.page).toBe(1);
    expect(res.limit).toBe(50);
  });

  it('findOne returns the doc', async () => {
    model.findOne.mockReturnValue(findChain({ id: 'i1' }));
    await expect(service.findOne(USER, 'i1')).resolves.toEqual({ id: 'i1' });
  });

  it('findOne throws when missing', async () => {
    model.findOne.mockReturnValue(findChain(null));
    await expect(service.findOne(USER, 'i1')).rejects.toThrow(NotFoundException);
  });

  it('update maps tags and returns the doc', async () => {
    model.findOneAndUpdate.mockReturnValue(findChain({ id: 'i1' }));
    await service.update(USER, 'i1', { name: 'B', tags: [TAG] });
    const update = model.findOneAndUpdate.mock.calls[0][1].$set;
    expect(update.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('update without tags leaves them untouched', async () => {
    model.findOneAndUpdate.mockReturnValue(findChain({ id: 'i1' }));
    await service.update(USER, 'i1', { name: 'B' });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.tags).toBeUndefined();
  });

  it('update throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue(findChain(null));
    await expect(service.update(USER, 'i1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove succeeds and throws appropriately', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 'i1')).resolves.toBeUndefined();
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 'i1')).rejects.toThrow(NotFoundException);
  });

  it('findAllForUser queries by user', async () => {
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ id: 'i1' }]) });
    await expect(service.findAllForUser(USER)).resolves.toEqual([{ id: 'i1' }]);
  });
});
