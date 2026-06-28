import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { candidaturas, plantoes, profissionais, schema } from '@vapt/db';
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
