import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const estabelecimentos = pgTable('estabelecimentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  razaoSocial: varchar('razao_social', { length: 255 }).notNull(),
  cnpj: varchar('cnpj', { length: 14 }).notNull().unique(),
  cep: varchar('cep', { length: 8 }).notNull(),
  endereco: varchar('endereco', { length: 500 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
