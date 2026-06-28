import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';

export const profissionais = pgTable('profissionais', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  nomeCompleto: varchar('nome_completo', { length: 255 }).notNull(),
  // Sensitive: CRMV license number — never log this field
  crmv: varchar('crmv', { length: 50 }).notNull().unique(),
  crmvAtivo: boolean('crmv_ativo').default(false).notNull(),
  // Optional PJ/CNPJ — sensitive fiscal data
  cnpj: varchar('cnpj', { length: 14 }),
  verificado: boolean('verificado').default(false).notNull(),
  backgroundCheckAprovado: boolean('background_check_aprovado').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
