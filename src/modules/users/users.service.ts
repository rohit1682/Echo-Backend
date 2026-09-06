import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { AuthProvider } from '../../common/enums';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  create(data: Partial<User>): Promise<UserDocument> {
    return this.userModel.create(data);
  }

  findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.userModel.findById(id).exec();
  }

  async getByIdOrThrow(id: string): Promise<UserDocument> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findByEmail(email: string, withSecrets = false): Promise<UserDocument | null> {
    const query = this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (withSecrets) query.select('+passwordHash +refreshTokenHash');
    return query.exec();
  }

  findByPhone(phone: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ phone: phone.trim() }).exec();
  }

  findByProvider(provider: AuthProvider, providerId: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ authProviders: { $elemMatch: { provider, providerId } } })
      .exec();
  }

  /** Persist the hashed current refresh token (or clear it on logout). */
  async setRefreshTokenHash(userId: string, hash: string | null): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $set: { refreshTokenHash: hash } }).exec();
  }

  /** Load a user including secret fields (used during token refresh). */
  findByIdWithSecrets(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return Promise.resolve(null);
    return this.userModel.findById(id).select('+refreshTokenHash').exec();
  }

  async linkProvider(userId: string, provider: AuthProvider, providerId: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $addToSet: { authProviders: { provider, providerId } } })
      .exec();
  }

  async addPushToken(userId: string, token: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $addToSet: { expoPushTokens: token } })
      .exec();
  }

  async removePushToken(userId: string, token: string): Promise<void> {
    await this.userModel.updateOne({ _id: userId }, { $pull: { expoPushTokens: token } }).exec();
  }

  async updateProfile(userId: string, data: Record<string, unknown>): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: data }, { new: true })
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
