CREATE TYPE "public"."metodo_pagamento" AS ENUM('PIX', 'CARTAO', 'BOLETO');--> statement-breakpoint
CREATE TYPE "public"."momento_captura" AS ENUM('ACEITE_CANDIDATURA', 'INICIO_PLANTAO', 'POS_CONCLUSAO');--> statement-breakpoint
CREATE TYPE "public"."politica_liberacao" AS ENUM('MANUAL_NA_CONCLUSAO', 'AUTOMATICA_POR_PRAZO', 'APOS_AVALIACAO_MUTUA');--> statement-breakpoint
ALTER TYPE "public"."pagamento_status" ADD VALUE 'RETIDO' BEFORE 'FALHOU';--> statement-breakpoint
ALTER TYPE "public"."pagamento_status" ADD VALUE 'LIBERADO' BEFORE 'FALHOU';--> statement-breakpoint
CREATE TABLE "configuracoes_plataforma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"taxa_estabelecimento_percentual" numeric(5, 2) DEFAULT '0' NOT NULL,
	"taxa_profissional_percentual" numeric(5, 2) DEFAULT '0' NOT NULL,
	"momento_captura" "momento_captura" DEFAULT 'ACEITE_CANDIDATURA' NOT NULL,
	"politica_liberacao" "politica_liberacao" DEFAULT 'MANUAL_NA_CONCLUSAO' NOT NULL,
	"escrow_dias_retencao" integer DEFAULT 7 NOT NULL,
	"aceita_pix" boolean DEFAULT true NOT NULL,
	"aceita_cartao" boolean DEFAULT true NOT NULL,
	"aceita_boleto" boolean DEFAULT true NOT NULL,
	"valor_minimo_plantao" numeric(10, 2) DEFAULT '0' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profissionais" ADD COLUMN "asaas_wallet_id" varchar(255);--> statement-breakpoint
ALTER TABLE "profissionais" ADD COLUMN "asaas_account_id" varchar(255);--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "valor_plantao" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "taxa_estabelecimento" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "taxa_profissional" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "valor_repasse" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "politica_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "metodo" "metodo_pagamento";--> statement-breakpoint
ALTER TABLE "pagamentos" ADD COLUMN "liberado_em" timestamp;