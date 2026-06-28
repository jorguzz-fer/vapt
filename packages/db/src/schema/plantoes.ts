import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  numeric,
  integer,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { estabelecimentos } from './estabelecimentos';
import { profissionais, especialidadeEnum } from './profissionais';

export const plantaoStatusEnum = pgEnum('plantao_status', [
  'ABERTA',
  'ACEITA',
  'CONFIRMADA',
  'EM_ANDAMENTO',
  'CONCLUIDA',
  'AVALIADA',
  'CANCELADA',
  'NO_SHOW',
]);

export const tipoPlantaoEnum = pgEnum('tipo_plantao', [
  'EMERGENCIA',
  'FIM_DE_SEMANA',
  'FERIAS',
  'COBERTURA_PERIODO',
]);

export const tipoPortaEnum = pgEnum('tipo_porta', ['ABERTA', 'FECHADA']);

export const duracaoEnum = pgEnum('duracao_plantao', [
  'H12',
  'H24',
  'SEMANA',
  'PERSONALIZADO',
]);

export { especialidadeEnum };

export const plantoes = pgTable('plantoes', {
  id: uuid('id').primaryKey().defaultRandom(),
  estabelecimentoId: uuid('estabelecimento_id')
    .notNull()
    .references(() => estabelecimentos.id),
  profissionalId: uuid('profissional_id').references(() => profissionais.id),
  status: plantaoStatusEnum('status').default('ABERTA').notNull(),
  tipo: tipoPlantaoEnum('tipo').notNull(),
  tipoPorta: tipoPortaEnum('tipo_porta').notNull(),
  duracao: duracaoEnum('duracao').notNull(),
  especialidade: especialidadeEnum('especialidade').notNull(),
  valorProposto: numeric('valor_proposto', { precision: 10, scale: 2 }).notNull(),
  valorFinal: numeric('valor_final', { precision: 10, scale: 2 }),
  volumePacientes: integer('volume_pacientes'),
  cep: varchar('cep', { length: 8 }).notNull(),
  localizacao: varchar('localizacao', { length: 500 }).notNull(),
  observacoes: varchar('observacoes', { length: 1000 }),
  motivoCancelamento: varchar('motivo_cancelamento', { length: 500 }),
  dataInicio: timestamp('data_inicio').notNull(),
  dataFim: timestamp('data_fim').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
