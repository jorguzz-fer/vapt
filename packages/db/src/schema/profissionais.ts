import { pgTable, uuid, varchar, timestamp, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './users';

export const especialidadeEnum = pgEnum('especialidade', [
  'PEQUENOS_ANIMAIS',
  'GRANDES_ANIMAIS',
  'EXOTICOS',
  'SILVESTRES',
  'GERAL',
]);

export const profissionais = pgTable('profissionais', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  nomeCompleto: varchar('nome_completo', { length: 255 }).notNull(),
  // Sensitive: CRMV license number — never log this field
  crmv: varchar('crmv', { length: 50 }).notNull().unique(),
  crmvAtivo: boolean('crmv_ativo').default(false).notNull(),
  especialidade: especialidadeEnum('especialidade'),
  bio: varchar('bio', { length: 500 }),
  fotoPerfil: varchar('foto_perfil', { length: 500 }),
  // Optional PJ/CNPJ — sensitive fiscal data
  cnpj: varchar('cnpj', { length: 14 }),
  verificado: boolean('verificado').default(false).notNull(),
  backgroundCheckAprovado: boolean('background_check_aprovado').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
