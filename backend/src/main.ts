import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as path from "node:path";
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:5173'
      ],
      //TODO: cors for production
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    },});
  const config = new DocumentBuilder()
    .setTitle('API documentation')
    .setDescription('API requests for FocusWord 2.0')
    .setVersion('2.0')
    .addTag('Auth')
    .addBearerAuth()
    .build();

  app.useStaticAssets(path.join(__dirname, '..', 'uploads'));
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });
  // Статическая раздача файлов из backend/uploads
  app.useStaticAssets(join(process.cwd(), 'backend', 'uploads'), {
    prefix: '/backend/uploads',
  });
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(process.env.PORT ?? 1331, '0.0.0.0');
}
bootstrap();
//TODO: USERS, ROLES, PAGES, LISTS, MEDIAFILES