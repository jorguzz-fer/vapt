import { Module } from '@nestjs/common';
import { AsaasService } from './asaas.service';
import { ContaRecebimentoController } from './conta-recebimento.controller';
import { ConfiguracaoModule } from '../configuracao/configuracao.module';

@Module({
  imports: [ConfiguracaoModule],
  controllers: [ContaRecebimentoController],
  providers: [AsaasService],
  exports: [AsaasService],
})
export class AsaasModule {}
