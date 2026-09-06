import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { ExpoPushService } from './expo-push.service';
import { UsersService } from '../users/users.service';

/**
 * Scaffolded reminder engine. The cron shell runs today and delivers any
 * already-scheduled notifications; the generation of reminders from due SIPs,
 * premiums, tasks and birthdays is wired up as those modules are implemented.
 */
@Injectable()
export class ReminderSchedulerService {
  private readonly logger = new Logger('ReminderScheduler');

  constructor(
    @InjectModel(Notification.name) private readonly model: Model<NotificationDocument>,
    private readonly push: ExpoPushService,
    private readonly users: UsersService,
  ) {}

  /** Every 15 minutes: deliver notifications whose time has arrived. */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async deliverDue(): Promise<void> {
    const due = await this.model
      .find({ sentAt: null, scheduledFor: { $lte: new Date() } })
      .limit(200)
      .exec();
    if (due.length === 0) return;

    this.logger.log(`Delivering ${due.length} due notification(s)`);
    for (const n of due) {
      const user = await this.users.findById(n.userId.toString());
      const tokens = user?.expoPushTokens ?? [];
      if (tokens.length > 0) {
        await this.push.send(tokens, n.title, n.body ?? '', n.data);
      }
      n.sentAt = new Date();
      await n.save();
    }
  }

  // TODO(notifications phase): @Cron(EVERY_DAY_AT_8AM) scan SIPs/premiums/tasks/
  // birthdays using each user's reminder lead-times and enqueue Notification docs.
}
