import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AssetsService } from './assets.service';

const USER = new Types.ObjectId().toHexString();
const TAG = new Types.ObjectId().toHexString();

describe('AssetsService', () => {
  let model: any;
  let service: AssetsService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    service = new AssetsService(model);
  });

  it('create maps tags and userId', async () => {
    model.create.mockResolvedValue({ id: 'a1' });
    await service.create(USER, { name: 'Car', currentValue: 1, tags: [TAG] } as any);
    const arg = model.create.mock.calls[0][0];
    expect(arg.userId).toBeInstanceOf(Types.ObjectId);
    expect(arg.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('create defaults tags to empty', async () => {
    model.create.mockResolvedValue({ id: 'a1' });
    await service.create(USER, { name: 'Car', currentValue: 1 } as any);
    expect(model.create.mock.calls[0][0].tags).toEqual([]);
  });

  it('list returns populated assets', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['a']),
    });
    await expect(service.list(USER)).resolves.toEqual(['a']);
  });

  it('update maps tags when provided', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'a1' }) });
    await service.update(USER, 'a1', { tags: [TAG] });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.tags[0]).toBeInstanceOf(Types.ObjectId);
  });

  it('update without tags', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'a1' }) });
    await service.update(USER, 'a1', { name: 'X' });
    expect(model.findOneAndUpdate.mock.calls[0][1].$set.tags).toBeUndefined();
  });

  it('update throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update(USER, 'a1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove handles found and missing', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 'a1')).resolves.toBeUndefined();
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 'a1')).rejects.toThrow(NotFoundException);
  });

  it('findAllForUser queries by user', async () => {
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(['a']) });
    await expect(service.findAllForUser(USER)).resolves.toEqual(['a']);
  });
});
