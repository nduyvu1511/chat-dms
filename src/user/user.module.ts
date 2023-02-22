import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET_KEY } from '@common/constant'
import { JwtService } from '@common/services'
import { conversationModule } from '@conversation/conversation.module'
import { GatewayModule } from '@gateway/gateway.module'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { AuthController, UserController } from './controllers'
import { TokenSchema, UserSchema } from './models'
import { UserRepository } from './repositories'
import { AuthService, UserService } from './services'

@Module({
  imports: [
    forwardRef(() => conversationModule),
    forwardRef(() => GatewayModule),
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
      {
        name: 'Token',
        schema: TokenSchema,
      },
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
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
  controllers: [UserController, AuthController],
  providers: [UserService, AuthService, JwtService, UserRepository],
  exports: [UserRepository, UserService],
})
export class UserModule {}
