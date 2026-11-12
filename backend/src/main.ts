import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Look&Lock API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup('docs', app, () =>
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3000);
}

await bootstrap();