import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  dotenv.config();

  app.enableCors({
    origin: ['http://localhost:5173', 'https://landix.group', 'http://127.0.0.1:5500']
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalInterceptors(new TransformInterceptor());
  app.setGlobalPrefix('api/');

  const config = new DocumentBuilder()
    .setTitle('Landix API')
    .setDescription('Документация для платформы Landix')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.use('/assets', (req, res) => {
    const filePath = path.join(process.cwd(), 'templates/assets', req.path.replace('/assets/', ''));

    if (!fs.existsSync(filePath)) {
      return res.status(404).send('Not found');
    }

    if (req.path.endsWith('.js')) {
      let js = fs.readFileSync(filePath, 'utf8');
      js = js.replace(/\/assets\//g, 'https://landix.group/assets/');
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      return res.send(js);
    }

    if (req.path.endsWith('.mp3')) {
      res.setHeader('Content-Type', 'audio/mpeg');
      return fs.createReadStream(filePath).pipe(res);
    }

    if (req.path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
      return fs.createReadStream(filePath).pipe(res);
    }

    if (/\.(?:png|jpg|jpeg|webp|gif)$/i.test(req.path)) {
      return fs.createReadStream(filePath).pipe(res);
    }

    return fs.createReadStream(filePath).pipe(res);
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
