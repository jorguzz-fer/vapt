import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { runSeed } from './seed-data';

/**
 * CLI de seed para desenvolvimento: `pnpm db:seed` (via tsx).
 * Em produção o seed roda via bootstrap da API (SEED_DB=true), reusando runSeed.
 */
async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida. Configure o .env antes de rodar o seed.');
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client, { schema });

  await runSeed(db);

  await client.end();
}

main().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
