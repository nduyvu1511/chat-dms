import { AttachmentModule } from '@attachment/attachment.module'
import { conversationModule } from '@conversation/conversation.module'
import { GatewayModule } from '@gateway/gateway.module'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { NotificationModule } from '@notification/notification.module'
import { PostModule } from '@post/post.module'
import { UserModule } from '@user/user.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URL),
    UserModule,
    conversationModule,
    AttachmentModule,
    GatewayModule,
    NotificationModule,
    PostModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
