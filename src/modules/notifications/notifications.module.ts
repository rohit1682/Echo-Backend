import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { ExpoPushService } from './expo-push.service';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UsersModule,
  ],
  providers: [NotificationsService, ExpoPushService, ReminderSchedulerService],
  controllers: [NotificationsController],
  exports: [NotificationsService, ExpoPushService],
})
export class NotificationsModule {}
