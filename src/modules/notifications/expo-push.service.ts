import { Injectable, Logger } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

/**
 * Thin wrapper over Expo's free push service (routes to FCM/APNs). Used by the
 * reminder scheduler and any feature that needs to notify a device.
 */
@Injectable()
export class ExpoPushService {
  private readonly logger = new Logger('ExpoPushService');
  private readonly expo = new Expo();

  /** Send a notification to one or more Expo push tokens. Invalid tokens are skipped. */
  async send(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    const messages: ExpoPushMessage[] = tokens
      .filter((t) => Expo.isExpoPushToken(t))
      .map((to) => ({ to, sound: 'default', title, body, data }));

    if (messages.length === 0) return;

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        this.logger.error(`Failed to send push chunk: ${(err as Error).message}`);
      }
    }
  }
}
