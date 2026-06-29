import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import helmet from '@fastify/helmet';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { runSeed, schema } from '@vapt/db';
import { AppModule } from './app.module';

/**
 * Aplica migrations no boot (idempotente — o drizzle controla o que já rodou)
 * e, se SEED_DB=true, popula dados de teste. Roda antes do app subir.
 *
 * Em produção a imagem é enxuta (sem pnpm/drizzle-kit/source), então este é o
 * caminho para migrar/semear sem expor o Postgres à internet.
 */
async function runDbBootstrap() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  const client = postgres(databaseUrl, { max: 1 });
  try {
    const db = drizzle(client, { schema });
    await migrate(db, { migrationsFolder: join(process.cwd(), 'drizzle') });
    console.log('Migrations aplicadas.');
    if (process.env.SEED_DB === 'true') {
      await runSeed(db);
    }
  } finally {
    await client.end();
  }
}

async function bootstrap() {
  await runDbBootstrap();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: process.env.NODE_ENV !== 'test' }),
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await app.register(helmet as any);

  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3333;
  await app.listen(port, '0.0.0.0');
  console.log(`API running on http://0.0.0.0:${port}`);
}

bootstrap();
