import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { CloudinaryProvider } from './provider'
import { AttachmentController } from './controllers'
import { AttachmentSchema } from './models'
import { AttachmentRepository } from './repositories'
import { AttachmentService } from './services'
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET_KEY } from '@common/constant'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Attachment',
        schema: AttachmentSchema,
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
  controllers: [AttachmentController],
  providers: [AttachmentService, AttachmentRepository, CloudinaryProvider],
  exports: [AttachmentRepository, AttachmentService],
})
export class AttachmentModule {}
