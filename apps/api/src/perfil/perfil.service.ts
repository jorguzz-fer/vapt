import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  estabelecimentos,
  profissionais,
  schema,
  users,
} from '@vapt/db';
import { UserRole } from '@vapt/shared';
import { DB } from '../database/database.module';
import { UpdatePerfilProfissionalDto } from './dto/update-perfil-profissional.dto';
import { UpdatePerfilEstabelecimentoDto } from './dto/update-perfil-estabelecimento.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class PerfilService {
  constructor(@Inject(DB) private readonly db: DrizzleDB) {}

  async getPerfil(userId: string, role: UserRole) {
    if (role === UserRole.PROFISSIONAL) {
      const [prof] = await this.db
        .select({
          id: profissionais.id,
          nomeCompleto: profissionais.nomeCompleto,
          crmv: profissionais.crmv,
          crmvAtivo: profissionais.crmvAtivo,
          especialidade: profissionais.especialidade,
          bio: profissionais.bio,
          cnpj: profissionais.cnpj,
          verificado: profissionais.verificado,
          backgroundCheckAprovado: profissionais.backgroundCheckAprovado,
          email: users.email,
          createdAt: profissionais.createdAt,
        })
        .from(profissionais)
        .innerJoin(users, eq(profissionais.userId, users.id))
        .where(eq(profissionais.userId, userId))
        .limit(1);

      if (!prof) throw new NotFoundException('Perfil não encontrado.');
      return prof;
    }

    if (role === UserRole.ESTABELECIMENTO) {
      const [estab] = await this.db
        .select({
          id: estabelecimentos.id,
          razaoSocial: estabelecimentos.razaoSocial,
          nomeFantasia: estabelecimentos.nomeFantasia,
          cnpj: estabelecimentos.cnpj,
          cep: estabelecimentos.cep,
          endereco: estabelecimentos.endereco,
          telefone: estabelecimentos.telefone,
          email: users.email,
          createdAt: estabelecimentos.createdAt,
        })
        .from(estabelecimentos)
        .innerJoin(users, eq(estabelecimentos.userId, users.id))
        .where(eq(estabelecimentos.userId, userId))
        .limit(1);

      if (!estab) throw new NotFoundException('Perfil não encontrado.');
      return estab;
    }

    throw new ForbiddenException();
  }

  async updatePerfilProfissional(userId: string, dto: UpdatePerfilProfissionalDto) {
    const [prof] = await this.db
      .select({ id: profissionais.id })
      .from(profissionais)
      .where(eq(profissionais.userId, userId))
      .limit(1);

    if (!prof) throw new NotFoundException('Profissional não encontrado.');

    const [updated] = await this.db
      .update(profissionais)
      .set({
        ...(dto.especialidade !== undefined && { especialidade: dto.especialidade }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        updatedAt: new Date(),
      })
      .where(eq(profissionais.id, prof.id))
      .returning({
        id: profissionais.id,
        especialidade: profissionais.especialidade,
        bio: profissionais.bio,
      });

    return updated;
  }

  async updatePerfilEstabelecimento(userId: string, dto: UpdatePerfilEstabelecimentoDto) {
    const [estab] = await this.db
      .select({ id: estabelecimentos.id })
      .from(estabelecimentos)
      .where(eq(estabelecimentos.userId, userId))
      .limit(1);

    if (!estab) throw new NotFoundException('Estabelecimento não encontrado.');

    const [updated] = await this.db
      .update(estabelecimentos)
      .set({
        ...(dto.nomeFantasia !== undefined && { nomeFantasia: dto.nomeFantasia }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.endereco !== undefined && { endereco: dto.endereco }),
        updatedAt: new Date(),
      })
      .where(eq(estabelecimentos.id, estab.id))
      .returning({
        id: estabelecimentos.id,
        nomeFantasia: estabelecimentos.nomeFantasia,
        telefone: estabelecimentos.telefone,
        endereco: estabelecimentos.endereco,
      });

    return updated;
  }
}
