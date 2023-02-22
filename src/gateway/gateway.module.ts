import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET_KEY } from '@common/constant'
import { conversationModule } from '@conversation/conversation.module'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { NotificationModule } from '@notification/notification.module'
import { UserModule } from '@user'
import { MessageGateway } from './message.gateway'
import { RoomGateway } from './room.gateway'
import { UserGateway } from './user.gateway'

@Module({
  imports: [
    NotificationModule,
    UserModule,
    forwardRef(() => conversationModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get(ACCESS_TOKEN_SECRET_KEY),
        signOptions: {
          expiresIn: configService.get(ACCESS_TOKEN_EXPIRES_IN),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [RoomGateway, UserGateway, MessageGateway],
  exports: [UserGateway, RoomGateway, MessageGateway],
})
export class GatewayModule {}
