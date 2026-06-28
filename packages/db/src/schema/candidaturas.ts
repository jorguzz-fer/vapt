import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { plantoes } from './plantoes';
import { profissionais } from './profissionais';

export const candidaturaStatusEnum = pgEnum('candidatura_status', [
  'PENDENTE',
  'ACEITA',
  'REJEITADA',
]);

export const candidaturas = pgTable(
  'candidaturas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    plantaoId: uuid('plantao_id')
      .notNull()
      .references(() => plantoes.id),
    profissionalId: uuid('profissional_id')
      .notNull()
      .references(() => profissionais.id),
    status: candidaturaStatusEnum('status').default('PENDENTE').notNull(),
    mensagem: varchar('mensagem', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('candidatura_unica_idx').on(table.plantaoId, table.profissionalId),
  ],
);
