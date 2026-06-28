import postgres from 'postgres';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

export * from './schema';
export { schema };
export type { PostgresJsDatabase };

export function createDb(databaseUrl: string): PostgresJsDatabase<typeof schema> {
  const client = postgres(databaseUrl);
  return drizzle(client, { schema });
}
