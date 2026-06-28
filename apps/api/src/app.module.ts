import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { PlantaoModule } from './plantao/plantao.module';
import { CandidaturaModule } from './candidatura/candidatura.module';
import { AdminModule } from './admin/admin.module';
import { AvaliacaoModule } from './avaliacao/avaliacao.module';

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
  ],
})
export class AppModule {}
