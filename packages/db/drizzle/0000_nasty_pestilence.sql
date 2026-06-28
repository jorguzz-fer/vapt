CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'ESTABELECIMENTO', 'PROFISSIONAL');--> statement-breakpoint
CREATE TYPE "public"."duracao_plantao" AS ENUM('H12', 'H24', 'SEMANA', 'PERSONALIZADO');--> statement-breakpoint
CREATE TYPE "public"."plantao_status" AS ENUM('ABERTA', 'ACEITA', 'CONFIRMADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'AVALIADA', 'CANCELADA', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."tipo_plantao" AS ENUM('EMERGENCIA', 'FIM_DE_SEMANA', 'FERIAS', 'COBERTURA_PERIODO');--> statement-breakpoint
CREATE TYPE "public"."tipo_porta" AS ENUM('ABERTA', 'FECHADA');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "user_role" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "estabelecimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"razao_social" varchar(255) NOT NULL,
	"cnpj" varchar(14) NOT NULL,
	"cep" varchar(8) NOT NULL,
	"endereco" varchar(500) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "estabelecimentos_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "profissionais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"nome_completo" varchar(255) NOT NULL,
	"crmv" varchar(50) NOT NULL,
	"crmv_ativo" boolean DEFAULT false NOT NULL,
	"cnpj" varchar(14),
	"verificado" boolean DEFAULT false NOT NULL,
	"background_check_aprovado" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "profissionais_crmv_unique" UNIQUE("crmv")
);
--> statement-breakpoint
CREATE TABLE "plantoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estabelecimento_id" uuid NOT NULL,
	"profissional_id" uuid,
	"status" "plantao_status" DEFAULT 'ABERTA' NOT NULL,
	"tipo" "tipo_plantao" NOT NULL,
	"tipo_porta" "tipo_porta" NOT NULL,
	"duracao" "duracao_plantao" NOT NULL,
	"valor_proposto" numeric(10, 2) NOT NULL,
	"volume_pacientes" integer,
	"localizacao" varchar(500) NOT NULL,
	"observacoes" varchar(1000),
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "estabelecimentos" ADD CONSTRAINT "estabelecimentos_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantoes" ADD CONSTRAINT "plantoes_estabelecimento_id_estabelecimentos_id_fk" FOREIGN KEY ("estabelecimento_id") REFERENCES "public"."estabelecimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plantoes" ADD CONSTRAINT "plantoes_profissional_id_profissionais_id_fk" FOREIGN KEY ("profissional_id") REFERENCES "public"."profissionais"("id") ON DELETE no action ON UPDATE no action;