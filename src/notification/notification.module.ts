import { Module } from '@nestjs/common'
import { OneSignalModule } from 'onesignal-api-client-nest'
import { NotificationService } from './services'

@Module({
  imports: [
    OneSignalModule.forRoot({
      appId: process.env.ONESIGNAL_ID,
      restApiKey: process.env.ONESIGNAL_KEY,
    }),
  ],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
