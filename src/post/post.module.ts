import { AttachmentModule } from '@attachment/attachment.module'
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET_KEY } from '@common/constant'
import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { UserModule } from '@user'
import { CategoryController, PostController } from './controllers'
import { CategorySchema, PostSchema } from './models'
import { CategoryRepository, PostRepository } from './repositories'
import { CategoryService, PostService } from './services'

@Module({
  imports: [
    UserModule,
    AttachmentModule,
    MongooseModule.forFeature([
      { name: 'Category', schema: CategorySchema },
      { name: 'Post', schema: PostSchema },
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

  controllers: [PostController, CategoryController],
  providers: [PostService, CategoryService, PostRepository, CategoryRepository],
  exports: [],
})
export class PostModule {}
