import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TagsService } from './tags.service';

const USER = new Types.ObjectId().toHexString();

describe('TagsService', () => {
  let model: any;
  let service: TagsService;

  beforeEach(() => {
    model = {
      find: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    service = new TagsService(model);
  });

  it('list returns the user tags sorted', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(['t']) }),
    });
    await expect(service.list(USER)).resolves.toEqual(['t']);
    expect(model.find).toHaveBeenCalledWith({ userId: USER });
  });

  it('create persists a tag', async () => {
    model.create.mockResolvedValue({ name: 'X' });
    await expect(service.create(USER, { name: 'X' })).resolves.toEqual({ name: 'X' });
  });

  it('create maps a duplicate-key error to Conflict', async () => {
    model.create.mockRejectedValue({ code: 11000 });
    await expect(service.create(USER, { name: 'X' })).rejects.toThrow(ConflictException);
  });

  it('create rethrows other errors', async () => {
    model.create.mockRejectedValue(new Error('db down'));
    await expect(service.create(USER, { name: 'X' })).rejects.toThrow('db down');
  });

  it('update returns the updated tag', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ name: 'Y' }) });
    await expect(service.update(USER, 't1', { name: 'Y' })).resolves.toEqual({ name: 'Y' });
  });

  it('update throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update(USER, 't1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove succeeds when a doc is deleted', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 't1')).resolves.toBeUndefined();
  });

  it('remove throws when nothing is deleted', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 't1')).rejects.toThrow(NotFoundException);
  });
});
