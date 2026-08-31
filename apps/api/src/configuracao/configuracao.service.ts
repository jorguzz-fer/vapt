import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { configuracoesPlataforma, schema } from '@vapt/db';
import { DB } from '../database/database.module';
import { UpdateConfiguracaoDto } from './dto/update-configuracao.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

export type Configuracao = typeof configuracoesPlataforma.$inferSelect;

@Injectable()
export class ConfiguracaoService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  /**
   * Política vigente da plataforma. É uma linha única: se ainda não existir,
   * cria com os defaults do schema.
   */
  async get(): Promise<Configuracao> {
    const [existente] = await this.db
      .select()
      .from(configuracoesPlataforma)
      .limit(1);

    if (existente) return existente;

    const [criada] = await this.db
      .insert(configuracoesPlataforma)
      .values({})
      .returning();

    return criada;
  }

  async update(dto: UpdateConfiguracaoDto): Promise<Configuracao> {
    const atual = await this.get();

    const [atualizada] = await this.db
      .update(configuracoesPlataforma)
      .set({
        ...(dto.taxaEstabelecimentoPercentual !== undefined && {
          taxaEstabelecimentoPercentual: String(dto.taxaEstabelecimentoPercentual),
        }),
        ...(dto.taxaProfissionalPercentual !== undefined && {
          taxaProfissionalPercentual: String(dto.taxaProfissionalPercentual),
        }),
        ...(dto.momentoCaptura !== undefined && {
          momentoCaptura: dto.momentoCaptura,
        }),
        ...(dto.politicaLiberacao !== undefined && {
          politicaLiberacao: dto.politicaLiberacao,
        }),
        ...(dto.escrowDiasRetencao !== undefined && {
          escrowDiasRetencao: dto.escrowDiasRetencao,
        }),
        ...(dto.aceitaPix !== undefined && { aceitaPix: dto.aceitaPix }),
        ...(dto.aceitaCartao !== undefined && { aceitaCartao: dto.aceitaCartao }),
        ...(dto.aceitaBoleto !== undefined && { aceitaBoleto: dto.aceitaBoleto }),
        ...(dto.valorMinimoPlantao !== undefined && {
          valorMinimoPlantao: String(dto.valorMinimoPlantao),
        }),
        updatedAt: new Date(),
      })
      .where(eq(configuracoesPlataforma.id, atual.id))
      .returning();

    return atualizada;
  }
}
