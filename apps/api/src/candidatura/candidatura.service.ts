import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq, ne } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { candidaturas, estabelecimentos, plantoes, profissionais, schema } from '@vapt/db';
import { DB } from '../database/database.module';
import { CreateCandidaturaDto } from './dto/create-candidatura.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class CandidaturaService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  async create(dto: CreateCandidaturaDto, userId: string) {
    const [prof] = await this.db
      .select({ id: profissionais.id })
      .from(profissionais)
      .where(eq(profissionais.userId, userId))
      .limit(1);

    if (!prof) throw new NotFoundException('Profissional não encontrado.');

    const [plantao] = await this.db
      .select({ id: plantoes.id, status: plantoes.status })
      .from(plantoes)
      .where(eq(plantoes.id, dto.plantaoId))
      .limit(1);

    if (!plantao) throw new NotFoundException('Plantão não encontrado.');

    if (plantao.status !== 'ABERTA') {
      throw new BadRequestException('Plantão não está disponível para candidaturas.');
    }

    try {
      const [candidatura] = await this.db
        .insert(candidaturas)
        .values({
          plantaoId: dto.plantaoId,
          profissionalId: prof.id,
          mensagem: dto.mensagem,
        })
        .returning();
      return candidatura;
    } catch (e: unknown) {
      const pg = e as { code?: string };
      if (pg.code === '23505') {
        throw new ConflictException('Você já se candidatou a este plantão.');
      }
      throw e;
    }
  }

  async aceitar(candidaturaId: string, userId: string) {
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    if (!estab) throw new NotFoundException('Estabelecimento não encontrado.');

    const [cand] = await this.db
      .select({
        id: candidaturas.id,
        plantaoId: candidaturas.plantaoId,
        profissionalId: candidaturas.profissionalId,
        status: candidaturas.status,
        estabelecimentoId: plantoes.estabelecimentoId,
        plantaoStatus: plantoes.status,
      })
      .from(candidaturas)
      .innerJoin(plantoes, eq(candidaturas.plantaoId, plantoes.id))
      .where(eq(candidaturas.id, candidaturaId))
      .limit(1);

    if (!cand) throw new NotFoundException('Candidatura não encontrada.');
    if (cand.estabelecimentoId !== estab.id) throw new ForbiddenException();
    if (cand.plantaoStatus !== 'ABERTA') {
      throw new BadRequestException('Plantão não está mais disponível para seleção.');
    }

    return this.db.transaction(async (tx) => {
      await tx
        .update(candidaturas)
        .set({ status: 'ACEITA', updatedAt: new Date() })
        .where(eq(candidaturas.id, candidaturaId));

      await tx
        .update(candidaturas)
        .set({ status: 'REJEITADA', updatedAt: new Date() })
        .where(
          and(
            eq(candidaturas.plantaoId, cand.plantaoId),
            ne(candidaturas.id, candidaturaId),
          ),
        );

      const [updated] = await tx
        .update(plantoes)
        .set({
          status: 'ACEITA',
          profissionalId: cand.profissionalId,
          updatedAt: new Date(),
        })
        .where(eq(plantoes.id, cand.plantaoId))
        .returning();

      return updated;
    });
  }

  async rejeitar(candidaturaId: string, userId: string) {
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    if (!estab) throw new NotFoundException('Estabelecimento não encontrado.');

    const [cand] = await this.db
      .select({
        id: candidaturas.id,
        status: candidaturas.status,
        estabelecimentoId: plantoes.estabelecimentoId,
      })
      .from(candidaturas)
      .innerJoin(plantoes, eq(candidaturas.plantaoId, plantoes.id))
      .where(eq(candidaturas.id, candidaturaId))
      .limit(1);

    if (!cand) throw new NotFoundException('Candidatura não encontrada.');
    if (cand.estabelecimentoId !== estab.id) throw new ForbiddenException();
    if (cand.status !== 'PENDENTE') {
      throw new BadRequestException('Candidatura não está pendente.');
    }

    const [updated] = await this.db
      .update(candidaturas)
      .set({ status: 'REJEITADA', updatedAt: new Date() })
      .where(eq(candidaturas.id, candidaturaId))
      .returning();

    return updated;
  }

  async findByProfissional(userId: string) {
    const [prof] = await this.db
      .select({ id: profissionais.id })
      .from(profissionais)
      .where(eq(profissionais.userId, userId))
      .limit(1);

    if (!prof) return [];

    return this.db
      .select({
        id: candidaturas.id,
        plantaoId: candidaturas.plantaoId,
        status: candidaturas.status,
        mensagem: candidaturas.mensagem,
        createdAt: candidaturas.createdAt,
        updatedAt: candidaturas.updatedAt,
      })
      .from(candidaturas)
      .where(eq(candidaturas.profissionalId, prof.id))
      .orderBy(desc(candidaturas.createdAt));
  }
}
