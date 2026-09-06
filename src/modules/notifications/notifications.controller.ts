import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

class PushTokenDto {
  @IsString()
  @MinLength(10)
  token: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  list(@CurrentUser('userId') userId: string) {
    return this.notifications.list(userId);
  }

  @Patch(':id/read')
  markRead(@CurrentUser('userId') userId: string, @Param('id') id: string) {
    return this.notifications.markRead(userId, id);
  }

  /** Register this device's Expo push token so reminders can reach it. */
  @Post('push-token')
  @HttpCode(204)
  register(@CurrentUser('userId') userId: string, @Body() dto: PushTokenDto) {
    return this.notifications.registerPushToken(userId, dto.token);
  }

  @Delete('push-token')
  @HttpCode(204)
  unregister(@CurrentUser('userId') userId: string, @Body() dto: PushTokenDto) {
    return this.notifications.removePushToken(userId, dto.token);
  }
}
