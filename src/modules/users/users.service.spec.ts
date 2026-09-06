import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { AuthProvider } from '../../common/enums';

const VALID_ID = new Types.ObjectId().toHexString();

function query(result: unknown) {
  return { select: jest.fn().mockReturnThis(), exec: jest.fn().mockResolvedValue(result) };
}

describe('UsersService', () => {
  let model: any;
  let service: UsersService;

  beforeEach(() => {
    model = {
      create: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    service = new UsersService(model);
  });

  it('create delegates to the model', async () => {
    model.create.mockResolvedValue({ id: 'u1' });
    await expect(service.create({ email: 'a@b.com' })).resolves.toEqual({ id: 'u1' });
    expect(model.create).toHaveBeenCalledWith({ email: 'a@b.com' });
  });

  it('findById returns null for an invalid id without hitting the db', async () => {
    await expect(service.findById('not-an-id')).resolves.toBeNull();
    expect(model.findById).not.toHaveBeenCalled();
  });

  it('findById queries for a valid id', async () => {
    model.findById.mockReturnValue(query({ id: VALID_ID }));
    await expect(service.findById(VALID_ID)).resolves.toEqual({ id: VALID_ID });
  });

  it('getByIdOrThrow throws when not found', async () => {
    model.findById.mockReturnValue(query(null));
    await expect(service.getByIdOrThrow(VALID_ID)).rejects.toThrow(NotFoundException);
  });

  it('getByIdOrThrow returns the user when found', async () => {
    model.findById.mockReturnValue(query({ id: VALID_ID }));
    await expect(service.getByIdOrThrow(VALID_ID)).resolves.toEqual({ id: VALID_ID });
  });

  it('findByEmail lowercases and can include secrets', async () => {
    const q = query({ id: 'u1' });
    model.findOne.mockReturnValue(q);
    await service.findByEmail('A@B.com', true);
    expect(model.findOne).toHaveBeenCalledWith({ email: 'a@b.com' });
    expect(q.select).toHaveBeenCalledWith('+passwordHash +refreshTokenHash');
  });

  it('findByEmail without secrets does not select', async () => {
    const q = query({ id: 'u1' });
    model.findOne.mockReturnValue(q);
    await service.findByEmail('a@b.com');
    expect(q.select).not.toHaveBeenCalled();
  });

  it('findByPhone queries by phone', async () => {
    model.findOne.mockReturnValue(query({ id: 'u1' }));
    await expect(service.findByPhone('+123')).resolves.toEqual({ id: 'u1' });
    expect(model.findOne).toHaveBeenCalledWith({ phone: '+123' });
  });

  it('findByProvider queries the authProviders array', async () => {
    model.findOne.mockReturnValue(query({ id: 'u1' }));
    await service.findByProvider(AuthProvider.GOOGLE, 'sub1');
    expect(model.findOne).toHaveBeenCalledWith({
      authProviders: { $elemMatch: { provider: AuthProvider.GOOGLE, providerId: 'sub1' } },
    });
  });

  it('setRefreshTokenHash updates the user', async () => {
    model.updateOne.mockReturnValue(query({}));
    await service.setRefreshTokenHash('u1', 'hash');
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $set: { refreshTokenHash: 'hash' } },
    );
  });

  it('findByIdWithSecrets returns null for invalid id', async () => {
    await expect(service.findByIdWithSecrets('bad')).resolves.toBeNull();
  });

  it('findByIdWithSecrets selects the refresh token for a valid id', async () => {
    const q = query({ id: VALID_ID });
    model.findById.mockReturnValue(q);
    await service.findByIdWithSecrets(VALID_ID);
    expect(q.select).toHaveBeenCalledWith('+refreshTokenHash');
  });

  it('linkProvider adds to the set', async () => {
    model.updateOne.mockReturnValue(query({}));
    await service.linkProvider('u1', AuthProvider.GOOGLE, 'sub1');
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $addToSet: { authProviders: { provider: AuthProvider.GOOGLE, providerId: 'sub1' } } },
    );
  });

  it('addPushToken / removePushToken update the token set', async () => {
    model.updateOne.mockReturnValue(query({}));
    await service.addPushToken('u1', 'tok');
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $addToSet: { expoPushTokens: 'tok' } },
    );
    await service.removePushToken('u1', 'tok');
    expect(model.updateOne).toHaveBeenCalledWith(
      { _id: 'u1' },
      { $pull: { expoPushTokens: 'tok' } },
    );
  });

  it('updateProfile returns the updated user', async () => {
    model.findByIdAndUpdate.mockReturnValue(query({ id: 'u1', name: 'New' }));
    await expect(service.updateProfile('u1', { name: 'New' })).resolves.toEqual({
      id: 'u1',
      name: 'New',
    });
  });

  it('updateProfile throws when the user is missing', async () => {
    model.findByIdAndUpdate.mockReturnValue(query(null));
    await expect(service.updateProfile('u1', {})).rejects.toThrow(NotFoundException);
  });
});
