import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  users,
  profissionais,
  estabelecimentos,
  schema,
} from '@vapt/db';
import { UserRole } from '@vapt/shared';
import { DB } from '../database/database.module';
import { LoginDto } from './dto/login.dto';
import { RegisterProfissionalDto } from './dto/register-profissional.dto';
import { RegisterEstabelecimentoDto } from './dto/register-estabelecimento.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB) private readonly db: DrizzleDB,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (!user) throw new UnauthorizedException('Credenciais inválidas.');

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas.');

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
    };
  }

  async registerProfissional(dto: RegisterProfissionalDto) {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length) throw new ConflictException('Email já cadastrado.');

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: dto.email, passwordHash, role: UserRole.PROFISSIONAL })
        .returning({ id: users.id, email: users.email, role: users.role });

      await tx.insert(profissionais).values({
        userId: user.id,
        nomeCompleto: dto.nomeCompleto,
        crmv: dto.crmv,
        cnpj: dto.cnpj,
      });

      return user;
    });
  }

  async registerEstabelecimento(dto: RegisterEstabelecimentoDto) {
    const existing = await this.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length) throw new ConflictException('Email já cadastrado.');

    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
    });

    return this.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({ email: dto.email, passwordHash, role: UserRole.ESTABELECIMENTO })
        .returning({ id: users.id, email: users.email, role: users.role });

      await tx.insert(estabelecimentos).values({
        userId: user.id,
        razaoSocial: dto.razaoSocial,
        cnpj: dto.cnpj,
        cep: dto.cep,
        endereco: dto.endereco,
      });

      return user;
    });
  }
}
