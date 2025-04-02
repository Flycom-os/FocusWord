import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'process';
import * as cookieParser from 'cookie-parser';

async function start() {
  const PORT = process.env.PORT || 5000;
  const app = await NestFactory.create(AppModule, { cors: { origin: true, credentials: true } });

  app.setGlobalPrefix('api');
  const config = new DocumentBuilder().setTitle('API панели администратора').setBasePath('api').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, document);
  app.use(cookieParser());
  app.enableShutdownHooks();
  await app.listen(PORT, () => {
    console.log(`Server has been started on port: ${PORT}`);
    console.log(`API docs: http://localhost:5000/docs#/`);
    console.log('PGAdmin: http://localhost:8080/');
  });
}

start();
