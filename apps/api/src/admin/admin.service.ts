import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  estabelecimentos,
  plantoes,
  profissionais,
  schema,
  users,
} from '@vapt/db';
import { DB } from '../database/database.module';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class AdminService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  async getStats() {
    const [[totalUsers], [totalProfs], [profsVerificados], [totalEstabs], [totalPlantoes], [plantoesPorStatus]] =
      await Promise.all([
        this.db.select({ total: count() }).from(users),
        this.db.select({ total: count() }).from(profissionais),
        this.db
          .select({ total: count() })
          .from(profissionais)
          .where(eq(profissionais.verificado, true)),
        this.db.select({ total: count() }).from(estabelecimentos),
        this.db.select({ total: count() }).from(plantoes),
        this.db
          .select({ total: count() })
          .from(plantoes)
          .where(eq(plantoes.status, 'ABERTA')),
      ]);

    return {
      totalUsers: totalUsers.total,
      totalProfissionais: totalProfs.total,
      profissionaisVerificados: profsVerificados.total,
      profissionaisPendentes: totalProfs.total - profsVerificados.total,
      totalEstabelecimentos: totalEstabs.total,
      totalPlantoes: totalPlantoes.total,
      plantoesAbertos: plantoesPorStatus.total,
    };
  }

  async listProfissionais() {
    return this.db
      .select({
        id: profissionais.id,
        userId: profissionais.userId,
        nomeCompleto: profissionais.nomeCompleto,
        crmv: profissionais.crmv,
        crmvAtivo: profissionais.crmvAtivo,
        especialidade: profissionais.especialidade,
        verificado: profissionais.verificado,
        backgroundCheckAprovado: profissionais.backgroundCheckAprovado,
        createdAt: profissionais.createdAt,
        email: users.email,
      })
      .from(profissionais)
      .innerJoin(users, eq(profissionais.userId, users.id))
      .orderBy(profissionais.createdAt);
  }

  async listEstabelecimentos() {
    return this.db
      .select({
        id: estabelecimentos.id,
        razaoSocial: estabelecimentos.razaoSocial,
        nomeFantasia: estabelecimentos.nomeFantasia,
        cnpj: estabelecimentos.cnpj,
        cep: estabelecimentos.cep,
        createdAt: estabelecimentos.createdAt,
        email: users.email,
      })
      .from(estabelecimentos)
      .innerJoin(users, eq(estabelecimentos.userId, users.id))
      .orderBy(estabelecimentos.createdAt);
  }

  async verificarProfissional(profissionalId: string) {
    const [updated] = await this.db
      .update(profissionais)
      .set({ verificado: true, crmvAtivo: true, updatedAt: new Date() })
      .where(eq(profissionais.id, profissionalId))
      .returning({
        id: profissionais.id,
        nomeCompleto: profissionais.nomeCompleto,
        verificado: profissionais.verificado,
      });

    if (!updated) throw new NotFoundException('Profissional não encontrado.');
    return updated;
  }
}
