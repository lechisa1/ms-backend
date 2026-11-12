import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { BigIntSerializerInterceptor } from './common/interceptors/bigint-serializer.interceptor';
import { SecuritySanitizerPipe } from './common/pipes/security-sanitizer.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', '*'),
    credentials: true,
  });

  app.useGlobalInterceptors(new BigIntSerializerInterceptor());

  app.useGlobalPipes(
    new SecuritySanitizerPipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Maintenance Management API')
    .setDescription(
      'Maintenance requests, items, technicians, work logs and approvals',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  Logger.log(`Listening on http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`Swagger docs on http://localhost:${port}/docs`, 'Bootstrap');
}

void bootstrap();
