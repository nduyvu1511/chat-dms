import { AttachmentModule } from '@attachment/attachment.module'
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET_KEY } from '@common/constant'
import { GatewayModule } from '@gateway/gateway.module'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from '@user'
import { UserSchema } from '@user/models'
import { MessageController, RoomController } from './controllers'
import { MessageSchema, RoomSchema } from './models'
import { MessageRepository, RoomRepository } from './repositories'
import { MessageService, RoomService } from './services'

@Module({
  imports: [
    forwardRef(() => GatewayModule),
    UserModule,
    AttachmentModule,
    MongooseModule.forFeature([
      {
        name: 'Room',
        schema: RoomSchema,
      },
      {
        name: 'Message',
        schema: MessageSchema,
      },
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
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

  controllers: [RoomController, MessageController],
  providers: [RoomService, RoomRepository, MessageRepository, MessageService],
  exports: [RoomService, MessageService, RoomRepository],
})
export class conversationModule {}
