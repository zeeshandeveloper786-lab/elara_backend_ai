import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  // Serve generated media files so clients can display images directly.
  // Example: GET /media/<filename>
  app.useStaticAssets(join(process.cwd(), 'storage', 'media'), {
    prefix: '/media',
  });

  // Serve generated proposal PDFs for direct download/view.
  // Example: GET /proposals/<filename>
  app.useStaticAssets(join(process.cwd(), 'storage', 'proposals'), {
    prefix: '/proposals',
  });

  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
