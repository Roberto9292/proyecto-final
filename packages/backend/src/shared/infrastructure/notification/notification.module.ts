import { Module } from '@nestjs/common';
import { NotificationPort } from '../../domain/notification.port';
import { HttpNotificationAdapter } from './http-notification.adapter';

@Module({
  providers: [
    {
      provide: NotificationPort,
      useClass: HttpNotificationAdapter,
    },
  ],
  exports: [NotificationPort],
})
export class NotificationModule {}
