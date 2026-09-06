import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly model: Model<NotificationDocument>,
    private readonly users: UsersService,
  ) {}

  list(userId: string): Promise<NotificationDocument[]> {
    return this.model.find({ userId }).sort({ scheduledFor: -1 }).limit(100).exec();
  }

  async markRead(userId: string, id: string): Promise<NotificationDocument> {
    const doc = await this.model
      .findOneAndUpdate({ _id: id, userId }, { $set: { read: true } }, { new: true })
      .exec();
    if (!doc) throw new NotFoundException('Notification not found');
    return doc;
  }

  registerPushToken(userId: string, token: string): Promise<void> {
    return this.users.addPushToken(userId, token);
  }

  removePushToken(userId: string, token: string): Promise<void> {
    return this.users.removePushToken(userId, token);
  }
}
