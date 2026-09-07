import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TasksService } from './tasks.service';

const USER = new Types.ObjectId().toHexString();
const TAG = new Types.ObjectId().toHexString();

describe('TasksService', () => {
  let model: any;
  let service: TasksService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    service = new TasksService(model);
  });

  it('create maps userId and tags', async () => {
    model.create.mockResolvedValue({ id: 't1' });
    await service.create(USER, { title: 'Pay bill', tags: [TAG] } as any);
    const arg = model.create.mock.calls[0][0];
    expect(arg.userId).toBeInstanceOf(Types.ObjectId);
    expect(arg.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('create defaults tags to empty', async () => {
    model.create.mockResolvedValue({ id: 't1' });
    await service.create(USER, { title: 'X' } as any);
    expect(model.create.mock.calls[0][0].tags).toEqual([]);
  });

  it('list returns populated tasks', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['t']),
    });
    await expect(service.list(USER)).resolves.toEqual(['t']);
  });

  it('update maps tags when provided', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 't1' }) });
    await service.update(USER, 't1', { tags: [TAG] });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('update marks completed with a completedAt timestamp', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 't1' }) });
    await service.update(USER, 't1', { completed: true });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.completedAt).toBeInstanceOf(Date);
  });

  it('update clears completedAt when un-completing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 't1' }) });
    await service.update(USER, 't1', { completed: false });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.completedAt).toBeNull();
  });

  it('update without completed/tags leaves them untouched', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 't1' }) });
    await service.update(USER, 't1', { title: 'New' });
    const set = model.findOneAndUpdate.mock.calls[0][1].$set;
    expect(set.completedAt).toBeUndefined();
    expect(set.tags).toBeUndefined();
  });

  it('update throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update(USER, 't1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove handles found and missing', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 't1')).resolves.toBeUndefined();
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 't1')).rejects.toThrow(NotFoundException);
  });
});
