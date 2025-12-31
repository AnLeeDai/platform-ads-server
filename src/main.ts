import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as mongoose from 'mongoose';

// Set global trim for all String fields in Mongoose
mongoose.Schema.Types.String.set('trim', true);

// Apply global settings to all schemas
mongoose.plugin((schema: mongoose.Schema) => {
  schema.set('versionKey', false);
  schema.set('timestamps', true);
});

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http/http-exception.filter';
import { ResponseInterceptor } from './common/http/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: true,
        excludeExtraneousValues: true,
      },
    }),
  );

  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new ResponseInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://platform-ads-admin.vercel.app',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization, x-custom-header',
    credentials: true,
  });

  const PORT = app.get(ConfigService).get<number>('PORT') || 3000;

  await app.listen(PORT);

  console.log('App running at http://localhost:' + PORT || 3000);

  const logMemoryUsage = () => {
    const usage = process.memoryUsage();
    console.log('Memory Usage:', {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      totalMemory: `${Math.round((usage.rss + usage.heapTotal + usage.heapUsed) / 1024 / 1024)} MB`,
    });
  };

  logMemoryUsage();
}

bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
