import {
  pgTable,
  uuid,
  numeric,
  varchar,
  timestamp,
  pgEnum,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { plantoes } from './plantoes';

export const pagamentoStatusEnum = pgEnum('pagamento_status', [
  'PENDENTE',
  'AGUARDANDO_CONFIRMACAO',
  'PAGO',
  'RETIDO',
  'LIBERADO',
  'FALHOU',
  'REEMBOLSADO',
]);

export const metodoPagamentoEnum = pgEnum('metodo_pagamento', [
  'PIX',
  'CARTAO',
  'BOLETO',
]);

export const pagamentos = pgTable(
  'pagamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    plantaoId: uuid('plantao_id')
      .notNull()
      .references(() => plantoes.id),
    /** Total cobrado do estabelecimento (valor do plantão + taxa dele). */
    valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
    status: pagamentoStatusEnum('status').default('PENDENTE').notNull(),

    // ── Breakdown do split, congelado na criação da cobrança ──
    /** Valor do plantão anunciado, antes de qualquer taxa. */
    valorPlantao: numeric('valor_plantao', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    /** Comissão paga pelo estabelecimento (por cima). */
    taxaEstabelecimento: numeric('taxa_estabelecimento', {
      precision: 10,
      scale: 2,
    })
      .default('0')
      .notNull(),
    /** Comissão descontada do profissional. */
    taxaProfissional: numeric('taxa_profissional', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    /** Líquido repassado ao profissional via split. */
    valorRepasse: numeric('valor_repasse', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    /**
     * Política vigente no momento da cobrança. Mudanças nas configurações da
     * plataforma não podem reescrever transações já em andamento.
     */
    politicaSnapshot: jsonb('politica_snapshot'),

    metodo: metodoPagamentoEnum('metodo'),
    gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
    /** Momento em que o valor retido foi liberado ao profissional. */
    liberadoEm: timestamp('liberado_em'),
    // Raw gateway response — never log this field
    gatewayPayload: jsonb('gateway_payload'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('pagamento_por_plantao_idx').on(table.plantaoId),
  ],
);
