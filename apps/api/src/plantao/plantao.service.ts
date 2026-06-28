import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { plantoes, estabelecimentos, schema } from '@vapt/db';
import { DB } from '../database/database.module';
import { CreatePlantaoDto } from './dto/create-plantao.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class PlantaoService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  async create(dto: CreatePlantaoDto, userId: string) {
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    if (!estab) throw new NotFoundException('Estabelecimento não encontrado.');

    const inicio = new Date(dto.dataInicio);
    const fim = new Date(dto.dataFim);
    if (fim <= inicio) {
      throw new BadRequestException(
        'Data fim deve ser posterior à data início.',
      );
    }

    const [plantao] = await this.db
      .insert(plantoes)
      .values({
        estabelecimentoId: estab.id,
        tipo: dto.tipo,
        tipoPorta: dto.tipoPorta,
        duracao: dto.duracao,
        especialidade: dto.especialidade,
        valorProposto: String(dto.valorProposto),
        volumePacientes: dto.volumePacientes,
        cep: dto.cep,
        localizacao: dto.localizacao,
        observacoes: dto.observacoes,
        dataInicio: inicio,
        dataFim: fim,
      })
      .returning();

    return plantao;
  }

  async findByEstabelecimento(userId: string) {
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    if (!estab) return [];

    return this.db
      .select()
      .from(plantoes)
      .where(eq(plantoes.estabelecimentoId, estab.id))
      .orderBy(desc(plantoes.createdAt));
  }

  async findAbertos() {
    return this.db
      .select()
      .from(plantoes)
      .where(eq(plantoes.status, 'ABERTA'))
      .orderBy(plantoes.dataInicio);
  }
}
