import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { and, count, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  avaliacoes,
  estabelecimentos,
  plantoes,
  profissionais,
  schema,
} from '@vapt/db';
import { DB } from '../database/database.module';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class AvaliacaoService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  async create(dto: CreateAvaliacaoDto, userId: string) {
    const [plantao] = await this.db
      .select({
        id: plantoes.id,
        status: plantoes.status,
        estabelecimentoId: plantoes.estabelecimentoId,
        profissionalId: plantoes.profissionalId,
      })
      .from(plantoes)
      .where(eq(plantoes.id, dto.plantaoId))
      .limit(1);

    if (!plantao) throw new NotFoundException('Plantão não encontrado.');
    if (plantao.status !== 'CONCLUIDA') {
      throw new BadRequestException('Plantão precisa estar concluído para ser avaliado.');
    }

    // Determine who is rating
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    let avaliadorRole: 'ESTABELECIMENTO' | 'PROFISSIONAL';

    if (estab && estab.id === plantao.estabelecimentoId) {
      avaliadorRole = 'ESTABELECIMENTO';
    } else {
      const [prof] = await this.db
        .select({ id: profissionais.id })
        .from(profissionais)
        .where(eq(profissionais.userId, userId))
        .limit(1);

      if (!prof || prof.id !== plantao.profissionalId) {
        throw new UnprocessableEntityException(
          'Você não participou deste plantão.',
        );
      }
      avaliadorRole = 'PROFISSIONAL';
    }

    try {
      const [avaliacao] = await this.db
        .insert(avaliacoes)
        .values({
          plantaoId: dto.plantaoId,
          avaliadorRole,
          nota: dto.nota,
          comentario: dto.comentario,
        })
        .returning();

      // Check if both sides have rated → mark plantão as AVALIADA
      const [{ total }] = await this.db
        .select({ total: count() })
        .from(avaliacoes)
        .where(eq(avaliacoes.plantaoId, dto.plantaoId));

      if (total >= 2) {
        await this.db
          .update(plantoes)
          .set({ status: 'AVALIADA', updatedAt: new Date() })
          .where(eq(plantoes.id, dto.plantaoId));
      }

      return avaliacao;
    } catch (e: unknown) {
      const pg = e as { code?: string };
      if (pg.code === '23505') {
        throw new ConflictException('Você já avaliou este plantão.');
      }
      throw e;
    }
  }

  async checkJaAvaliou(plantaoId: string, userId: string): Promise<{ jaAvaliou: boolean }> {
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    const avaliadorRole: 'ESTABELECIMENTO' | 'PROFISSIONAL' = estab
      ? 'ESTABELECIMENTO'
      : 'PROFISSIONAL';

    const [existing] = await this.db
      .select({ id: avaliacoes.id })
      .from(avaliacoes)
      .where(
        and(
          eq(avaliacoes.plantaoId, plantaoId),
          eq(avaliacoes.avaliadorRole, avaliadorRole),
        ),
      )
      .limit(1);

    return { jaAvaliou: !!existing };
  }
}
