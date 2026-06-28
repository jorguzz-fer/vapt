CREATE TYPE "public"."especialidade" AS ENUM('PEQUENOS_ANIMAIS', 'GRANDES_ANIMAIS', 'EXOTICOS', 'SILVESTRES', 'GERAL');--> statement-breakpoint
CREATE TYPE "public"."candidatura_status" AS ENUM('PENDENTE', 'ACEITA', 'REJEITADA');--> statement-breakpoint
CREATE TYPE "public"."avaliador_role" AS ENUM('ESTABELECIMENTO', 'PROFISSIONAL');--> statement-breakpoint
CREATE TYPE "public"."pagamento_status" AS ENUM('PENDENTE', 'AGUARDANDO_CONFIRMACAO', 'PAGO', 'FALHOU', 'REEMBOLSADO');--> statement-breakpoint
CREATE TABLE "candidaturas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plantao_id" uuid NOT NULL,
	"profissional_id" uuid NOT NULL,
	"status" "candidatura_status" DEFAULT 'PENDENTE' NOT NULL,
	"mensagem" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avaliacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plantao_id" uuid NOT NULL,
	"avaliador_role" "avaliador_role" NOT NULL,
	"nota" integer NOT NULL,
	"comentario" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plantao_id" uuid NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"status" "pagamento_status" DEFAULT 'PENDENTE' NOT NULL,
	"gateway_transaction_id" varchar(255),
	"gateway_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "estabelecimentos" ADD COLUMN "nome_fantasia" varchar(255);--> statement-breakpoint
ALTER TABLE "estabelecimentos" ADD COLUMN "telefone" varchar(20);--> statement-breakpoint
ALTER TABLE "profissionais" ADD COLUMN "especialidade" "especialidade";--> statement-breakpoint
ALTER TABLE "profissionais" ADD COLUMN "bio" varchar(500);--> statement-breakpoint
ALTER TABLE "profissionais" ADD COLUMN "foto_perfil" varchar(500);--> statement-breakpoint
ALTER TABLE "plantoes" ADD COLUMN "especialidade" "especialidade" NOT NULL;--> statement-breakpoint
ALTER TABLE "plantoes" ADD COLUMN "valor_final" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "plantoes" ADD COLUMN "cep" varchar(8) NOT NULL;--> statement-breakpoint
ALTER TABLE "plantoes" ADD COLUMN "motivo_cancelamento" varchar(500);--> statement-breakpoint
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_plantao_id_plantoes_id_fk" FOREIGN KEY ("plantao_id") REFERENCES "public"."plantoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidaturas" ADD CONSTRAINT "candidaturas_profissional_id_profissionais_id_fk" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_plantao_id_plantoes_id_fk" FOREIGN KEY ("plantao_id") REFERENCES "public"."plantoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_plantao_id_plantoes_id_fk" FOREIGN KEY ("plantao_id") REFERENCES "public"."plantoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "candidatura_unica_idx" ON "candidaturas" USING btree ("plantao_id","profissional_id");--> statement-breakpoint
CREATE UNIQUE INDEX "avaliacao_unica_idx" ON "avaliacoes" USING btree ("plantao_id","avaliador_role");--> statement-breakpoint
CREATE UNIQUE INDEX "pagamento_por_plantao_idx" ON "pagamentos" USING btree ("plantao_id");