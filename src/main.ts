import { SocketIoAdapter } from '@gateway/gateway.adapter'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { ServiceAccount } from 'firebase-admin'
import { AppModule } from './app.module'
import * as admin from 'firebase-admin'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ skipMissingProperties: true }))
  app.enableCors({ origin: true })
  app.useWebSocketAdapter(new SocketIoAdapter(app))

  const configService: ConfigService = app.get(ConfigService)
  const adminConfig: ServiceAccount = {
    projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
    privateKey: configService.get<string>('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  }
  // Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    storageBucket: 'nestjs-server-15c56.appspot.com',
    // databaseURL: 'https://xxxxx.firebaseio.com',
  })

  const config = new DocumentBuilder()

    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'token'
    )
    .setTitle('Chat API')
    .setDescription('Chat API Documentation')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  await app.listen(configService.get<string>('API_PORT') || 5000)
}
bootstrap()
