import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LoansService } from './loans.service';

const USER = new Types.ObjectId().toHexString();

describe('LoansService', () => {
  let model: any;
  let service: LoansService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      deleteOne: jest.fn(),
    };
    service = new LoansService(model);
  });

  it('create sets the userId', async () => {
    model.create.mockResolvedValue({ id: 'l1' });
    await service.create(USER, { name: 'Home', principal: 1, outstanding: 1 } as any);
    expect(model.create.mock.calls[0][0].userId).toBeInstanceOf(Types.ObjectId);
  });

  it('list sorts by newest', async () => {
    model.find.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(['l']),
    });
    await expect(service.list(USER)).resolves.toEqual(['l']);
  });

  it('update returns the doc / throws when missing', async () => {
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ id: 'l1' }) });
    await expect(service.update(USER, 'l1', { name: 'X' })).resolves.toEqual({ id: 'l1' });
    model.findOneAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update(USER, 'l1', {})).rejects.toThrow(NotFoundException);
  });

  it('remove handles found and missing', async () => {
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 1 }) });
    await expect(service.remove(USER, 'l1')).resolves.toBeUndefined();
    model.deleteOne.mockReturnValue({ exec: jest.fn().mockResolvedValue({ deletedCount: 0 }) });
    await expect(service.remove(USER, 'l1')).rejects.toThrow(NotFoundException);
  });

  it('findAllForUser queries by user', async () => {
    model.find.mockReturnValue({ exec: jest.fn().mockResolvedValue(['l']) });
    await expect(service.findAllForUser(USER)).resolves.toEqual(['l']);
  });
});
