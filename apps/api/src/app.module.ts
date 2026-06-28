import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PlantaoModule } from './plantao/plantao.module';
import { CandidaturaModule } from './candidatura/candidatura.module';
import { AdminModule } from './admin/admin.module';
import { AvaliacaoModule } from './avaliacao/avaliacao.module';
import { PerfilModule } from './perfil/perfil.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    HealthModule,
    PlantaoModule,
    CandidaturaModule,
    AdminModule,
    AvaliacaoModule,
    PerfilModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
