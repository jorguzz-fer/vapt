import {
  pgTable,
  uuid,
  numeric,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

/** Quando a cobrança do estabelecimento é criada no gateway. */
export const momentoCapturaEnum = pgEnum('momento_captura', [
  'ACEITE_CANDIDATURA',
  'INICIO_PLANTAO',
  'POS_CONCLUSAO',
]);

/** Como o valor retido no escrow é liberado para o profissional. */
export const politicaLiberacaoEnum = pgEnum('politica_liberacao', [
  'MANUAL_NA_CONCLUSAO',
  'AUTOMATICA_POR_PRAZO',
  'APOS_AVALIACAO_MUTUA',
]);

/**
 * Política de pagamento da plataforma — linha única, editável pelo admin.
 *
 * Os valores aqui são a política *vigente*. Todo pagamento criado grava um
 * snapshot da política que usou, para que alterações não reescrevam o valor
 * de transações já em andamento.
 */
export const configuracoesPlataforma = pgTable('configuracoes_plataforma', {
  id: uuid('id').primaryKey().defaultRandom(),

  /** Comissão cobrada do estabelecimento, por cima do valor do plantão. */
  taxaEstabelecimentoPercentual: numeric('taxa_estabelecimento_percentual', {
    precision: 5,
    scale: 2,
  })
    .default('0')
    .notNull(),

  /** Comissão descontada do repasse ao profissional. */
  taxaProfissionalPercentual: numeric('taxa_profissional_percentual', {
    precision: 5,
    scale: 2,
  })
    .default('0')
    .notNull(),

  momentoCaptura: momentoCapturaEnum('momento_captura')
    .default('ACEITE_CANDIDATURA')
    .notNull(),

  politicaLiberacao: politicaLiberacaoEnum('politica_liberacao')
    .default('MANUAL_NA_CONCLUSAO')
    .notNull(),

  /** Rede de segurança: dias até o Asaas liberar o escrow sozinho. */
  escrowDiasRetencao: integer('escrow_dias_retencao').default(7).notNull(),

  aceitaPix: boolean('aceita_pix').default(true).notNull(),
  aceitaCartao: boolean('aceita_cartao').default(true).notNull(),
  aceitaBoleto: boolean('aceita_boleto').default(true).notNull(),

  /** Régua de preço mínimo: valor mínimo aceito ao publicar um plantão. */
  valorMinimoPlantao: numeric('valor_minimo_plantao', {
    precision: 10,
    scale: 2,
  })
    .default('0')
    .notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
