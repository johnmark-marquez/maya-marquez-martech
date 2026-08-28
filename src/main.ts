import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.setGlobalPrefix('api');

  // Adding swagger documentation for the APIs that we will be creating.
  const swaggerConfiguration = new DocumentBuilder()
    .setTitle('Marquez Technical Exam - Money Transfer API')
    .setDescription('API documentation for the Money Transfer APIs')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app as any, swaggerConfiguration);
  SwaggerModule.setup('/api/docs', app as any, document);


  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
