import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createStubController } from '../../common/stub.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { Birthday, BirthdaySchema } from './schemas/birthday.schema';
import { Task, TaskSchema } from './schemas/task.schema';

/**
 * Registers Personal Activity data models (calendar events, birthdays, tasks) and
 * exposes placeholder endpoints. Each becomes a full module (with device
 * calendar/contacts sync for events & birthdays) in its phase.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Birthday.name, schema: BirthdaySchema },
      { name: Task.name, schema: TaskSchema },
    ]),
  ],
  controllers: [
    createStubController('activity/events', 'Calendar & events'),
    createStubController('activity/birthdays', 'Birthdays & important dates'),
    createStubController('activity/tasks', 'Daily tasks'),
  ] as any,
})
export class ActivityStubsModule {}
