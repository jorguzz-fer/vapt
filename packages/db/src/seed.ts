import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';
import * as schema from './schema';
import { users, estabelecimentos, profissionais, plantoes } from './schema';

/**
 * Seed idempotente para desenvolvimento.
 *
 * Cria usuários de teste (admin, estabelecimento, profissionais) e alguns
 * plantões abertos. Hash de senha usa argon2id — mesmo algoritmo do
 * AuthService — para que o login funcione com as credenciais abaixo.
 *
 * LGPD: este script NUNCA loga CRMV, CNPJ, CEP ou hashes de senha.
 * Apenas e-mail e role aparecem na saída.
 */

const SENHA_PADRAO = 'senha123';

const hashSenha = (senha: string) =>
  argon2.hash(senha, { type: argon2.argon2id });

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL não definida. Configure o .env antes de rodar o seed.');
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client, { schema });

  console.log('🌱 Iniciando seed…');

  const passwordHash = await hashSenha(SENHA_PADRAO);

  /**
   * Cria (ou retorna o existente) um usuário pelo e-mail. Idempotente:
   * rodar o seed várias vezes não duplica registros.
   */
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

  console.log('\n✅ Seed concluído.');
  console.log(`   Login de teste — senha para todos: ${SENHA_PADRAO}`);
  console.log('   admin@vapt.com.br · clinica@vapt.com.br · vet1@vapt.com.br · vet2@vapt.com.br');

  await client.end();
}

main().catch((err) => {
  console.error('❌ Seed falhou:', err);
  process.exit(1);
});
