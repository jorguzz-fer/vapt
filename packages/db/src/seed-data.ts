import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';
import { users, estabelecimentos, profissionais, plantoes } from './schema';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

/**
 * Lógica de seed idempotente, reutilizável tanto pelo CLI de dev
 * (`tsx src/seed.ts`) quanto pelo bootstrap da API em produção.
 *
 * LGPD: NUNCA loga CRMV, CNPJ, CEP ou hashes de senha. Apenas e-mail e role.
 */

export const SENHA_PADRAO = 'senha123';

export async function runSeed(db: DrizzleDB): Promise<void> {
  console.log('🌱 Iniciando seed…');

  const passwordHash = await argon2.hash(SENHA_PADRAO, {
    type: argon2.argon2id,
  });

  /** Cria (ou retorna o existente) um usuário pelo e-mail. Idempotente. */
  async function upsertUser(
    email: string,
    role: 'ADMIN' | 'ESTABELECIMENTO' | 'PROFISSIONAL',
  ): Promise<{ id: string; novo: boolean }> {
    const [existente] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existente) {
      console.log(`  ↩ ${role.padEnd(15)} ${email} (já existe)`);
      return { id: existente.id, novo: false };
    }

    const [user] = await db
      .insert(users)
      .values({ email, passwordHash, role })
      .returning({ id: users.id });

    console.log(`  ✓ ${role.padEnd(15)} ${email}`);
    return { id: user.id, novo: true };
  }

  // ── Admin ──────────────────────────────────────────────────────────────────
  await upsertUser('admin@vapt.com.br', 'ADMIN');

  // ── Estabelecimento ──────────────────────────────────────────────────────────
  const estabUser = await upsertUser('clinica@vapt.com.br', 'ESTABELECIMENTO');
  let estabelecimentoId: string;
  const [estabExistente] = await db
    .select({ id: estabelecimentos.id })
    .from(estabelecimentos)
    .where(eq(estabelecimentos.userId, estabUser.id))
    .limit(1);

  if (estabExistente) {
    estabelecimentoId = estabExistente.id;
  } else {
    const [estab] = await db
      .insert(estabelecimentos)
      .values({
        userId: estabUser.id,
        razaoSocial: 'Clínica Veterinária Pet Care LTDA',
        nomeFantasia: 'Pet Care 24h',
        cnpj: '12345678000190',
        cep: '01310100',
        endereco: 'Av. Paulista, 1000 — São Paulo, SP',
        telefone: '11999990000',
      })
      .returning({ id: estabelecimentos.id });
    estabelecimentoId = estab.id;
  }

  // ── Profissionais ────────────────────────────────────────────────────────────
  const profSpecs = [
    {
      email: 'vet1@vapt.com.br',
      nomeCompleto: 'Dra. Ana Souza',
      crmv: 'SP-12345',
      especialidade: 'PEQUENOS_ANIMAIS' as const,
      bio: 'Clínica geral de pequenos animais, 8 anos de experiência.',
    },
    {
      email: 'vet2@vapt.com.br',
      nomeCompleto: 'Dr. Bruno Lima',
      crmv: 'SP-67890',
      especialidade: 'EXOTICOS' as const,
      bio: 'Especialista em animais exóticos e silvestres.',
    },
  ];

  for (const spec of profSpecs) {
    const profUser = await upsertUser(spec.email, 'PROFISSIONAL');
    const [profExistente] = await db
      .select({ id: profissionais.id })
      .from(profissionais)
      .where(eq(profissionais.userId, profUser.id))
      .limit(1);

    if (!profExistente) {
      await db.insert(profissionais).values({
        userId: profUser.id,
        nomeCompleto: spec.nomeCompleto,
        crmv: spec.crmv,
        crmvAtivo: true,
        especialidade: spec.especialidade,
        bio: spec.bio,
        verificado: true,
        backgroundCheckAprovado: true,
      });
    }
  }

  // ── Plantões abertos ─────────────────────────────────────────────────────────
  const [temPlantao] = await db
    .select({ id: plantoes.id })
    .from(plantoes)
    .where(eq(plantoes.estabelecimentoId, estabelecimentoId))
    .limit(1);

  if (!temPlantao) {
    const agora = Date.now();
    const dia = 24 * 60 * 60 * 1000;
    await db.insert(plantoes).values([
      {
        estabelecimentoId,
        tipo: 'EMERGENCIA',
        tipoPorta: 'ABERTA',
        duracao: 'H12',
        especialidade: 'PEQUENOS_ANIMAIS',
        valorProposto: '800.00',
        volumePacientes: 15,
        cep: '01310100',
        localizacao: 'Av. Paulista, 1000 — São Paulo, SP',
        observacoes: 'Plantão noturno de emergência, equipe de apoio disponível.',
        dataInicio: new Date(agora + dia),
        dataFim: new Date(agora + dia + 12 * 60 * 60 * 1000),
      },
      {
        estabelecimentoId,
        tipo: 'FIM_DE_SEMANA',
        tipoPorta: 'FECHADA',
        duracao: 'H24',
        especialidade: 'GERAL',
        valorProposto: '1500.00',
        volumePacientes: 30,
        cep: '01310100',
        localizacao: 'Av. Paulista, 1000 — São Paulo, SP',
        observacoes: 'Cobertura de fim de semana, sábado e domingo.',
        dataInicio: new Date(agora + 3 * dia),
        dataFim: new Date(agora + 4 * dia),
      },
    ]);
    console.log('  ✓ 2 plantões abertos criados');
  } else {
    console.log('  ↩ plantões já existem (pulando)');
  }

  console.log('✅ Seed concluído.');
  console.log(`   Login de teste — senha para todos: ${SENHA_PADRAO}`);
  console.log('   admin@vapt.com.br · clinica@vapt.com.br · vet1@vapt.com.br · vet2@vapt.com.br');
}
