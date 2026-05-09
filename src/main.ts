import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║        ReviewMgmt Backend Started            ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log(`  URL     : http://localhost:${port}/api`);
  console.log(`  Routes  : POST /api/review/generate`);
  console.log(`            POST /api/review/submit`);
  console.log('════════════════════════════════════════════════\n');
}
bootstrap();
