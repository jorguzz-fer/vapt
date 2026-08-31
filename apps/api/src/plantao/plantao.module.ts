import { Module } from '@nestjs/common';
import { PlantaoController } from './plantao.controller';
import { PlantaoService } from './plantao.service';
import { ConfiguracaoModule } from '../configuracao/configuracao.module';

@Module({
  imports: [ConfiguracaoModule],
  controllers: [PlantaoController],
  providers: [PlantaoService],
})
export class PlantaoModule {}
