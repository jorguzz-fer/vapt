import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { plantoes } from './plantoes';

export const avaliadorRoleEnum = pgEnum('avaliador_role', [
  'ESTABELECIMENTO',
  'PROFISSIONAL',
]);

export const avaliacoes = pgTable(
  'avaliacoes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    plantaoId: uuid('plantao_id')
      .notNull()
      .references(() => plantoes.id),
    avaliadorRole: avaliadorRoleEnum('avaliador_role').notNull(),
    nota: integer('nota').notNull(),
    comentario: varchar('comentario', { length: 1000 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('avaliacao_unica_idx').on(table.plantaoId, table.avaliadorRole),
  ],
);
