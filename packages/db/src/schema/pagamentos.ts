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
  'FALHOU',
  'REEMBOLSADO',
]);

export const pagamentos = pgTable(
  'pagamentos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    plantaoId: uuid('plantao_id')
      .notNull()
      .references(() => plantoes.id),
    valor: numeric('valor', { precision: 10, scale: 2 }).notNull(),
    status: pagamentoStatusEnum('status').default('PENDENTE').notNull(),
    gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
    // Raw gateway response — never log this field
    gatewayPayload: jsonb('gateway_payload'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('pagamento_por_plantao_idx').on(table.plantaoId),
  ],
);
