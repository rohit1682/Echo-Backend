import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { createStubController } from '../../common/stub.controller';
import { Event, EventSchema } from './schemas/event.schema';
import { Birthday, BirthdaySchema } from './schemas/birthday.schema';

/**
 * Registers the still-stubbed Personal Activity data models (calendar events,
 * birthdays) and exposes placeholder endpoints. Each becomes a full module (with
 * device calendar/contacts sync) in its phase. Tasks are fully implemented in
 * `tasks/` — mirror that module when building events/birthdays.
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Birthday.name, schema: BirthdaySchema },
    ]),
  ],
  controllers: [
    createStubController('activity/events', 'Calendar & events'),
    createStubController('activity/birthdays', 'Birthdays & important dates'),
  ] as any,
})
export class ActivityStubsModule {}
