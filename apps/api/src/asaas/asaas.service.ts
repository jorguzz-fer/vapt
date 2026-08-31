import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { profissionais, schema, users } from '@vapt/db';
import { DB } from '../database/database.module';
import { ConfiguracaoService } from '../configuracao/configuracao.service';
import { AsaasClient, AsaasError } from './asaas.client';
import { CriarContaRecebimentoDto } from './dto/criar-conta-recebimento.dto';

type DrizzleDB = PostgresJsDatabase<typeof schema>;

export interface StatusContaRecebimento {
  /** Só com a conta criada o profissional pode receber repasse via split. */
  podeReceber: boolean;
  walletId: string | null;
}

@Injectable()
export class AsaasService {
  private readonly logger = new Logger(AsaasService.name);

  constructor(
    @Inject(DB) private readonly db: DrizzleDB,
    private readonly configuracaoService: ConfiguracaoService,
  ) {}

  /**
   * Construído sob demanda para que a API suba mesmo sem o Asaas configurado.
   * A ausência de credencial vira 503 com causa explícita — um 500 genérico
   * faria uma falha de configuração parecer bug de aplicação.
   */
  private client(): AsaasClient {
    const apiKey = process.env.ASAAS_API_KEY;
    const baseUrl = process.env.ASAAS_BASE_URL;

    if (!apiKey || !baseUrl) {
      const faltando = [
        !apiKey && 'ASAAS_API_KEY',
        !baseUrl && 'ASAAS_BASE_URL',
      ].filter(Boolean);

      this.logger.error(`Asaas não configurado: faltam ${faltando.join(', ')}.`);
      throw new ServiceUnavailableException(
        'Pagamentos indisponíveis: gateway não configurado.',
      );
    }

    return new AsaasClient({ apiKey, baseUrl });
  }

  async obterStatus(userId: string): Promise<StatusContaRecebimento> {
    const profissional = await this.buscarProfissional(userId);

    return {
      podeReceber: Boolean(profissional.asaasWalletId),
      walletId: profissional.asaasWalletId,
    };
  }

  /**
   * Cria a subconta de recebimento do profissional e habilita a Conta Escrow
   * nela — sem isso o valor do plantão não tem para onde ser repassado no
   * split, nem fica retido até a conclusão.
   *
   * Os dados pessoais exigidos pelo Asaas (CPF/CNPJ, telefone, endereço) são
   * repassados e não persistidos: guardamos apenas os identificadores.
   */
  async criarContaRecebimento(
    userId: string,
    dto: CriarContaRecebimentoDto,
  ): Promise<StatusContaRecebimento> {
    const profissional = await this.buscarProfissional(userId);

    if (profissional.asaasWalletId) {
      throw new ConflictException('Conta de recebimento já cadastrada.');
    }

    const [usuario] = await this.db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const { escrowDiasRetencao } = await this.configuracaoService.get();
    const client = this.client();

    // A subconta pode já existir de uma tentativa anterior que falhou ao
    // configurar o escrow; nesse caso o id está salvo e só falta o escrow.
    let accountId = profissional.asaasAccountId;

    if (!accountId) {
      const subconta = await this.executar(() =>
        client.criarSubconta({
          name: profissional.nomeCompleto,
          email: usuario.email,
          cpfCnpj: dto.cpfCnpj,
          mobilePhone: dto.mobilePhone,
          incomeValue: dto.incomeValue,
          postalCode: dto.postalCode,
          address: dto.address,
          addressNumber: dto.addressNumber,
          province: dto.province,
        }),
      );

      accountId = subconta.id;

      // Grava antes de configurar o escrow: se o passo seguinte falhar, uma
      // nova tentativa retoma daqui em vez de criar outra subconta.
      await this.db
        .update(profissionais)
        .set({ asaasAccountId: subconta.id, updatedAt: new Date() })
        .where(eq(profissionais.id, profissional.id));

      this.logger.log(`Subconta Asaas criada para profissional ${profissional.id}.`);
    }

    await this.executar(() => client.configurarEscrow(accountId, escrowDiasRetencao));

    // O walletId só é publicado após o escrow estar ativo: é ele que habilita
    // o repasse, e habilitar antes deixaria o valor cair liberado.
    const walletId = await this.recuperarWalletId(client, accountId, profissional.id);

    await this.db
      .update(profissionais)
      .set({ asaasWalletId: walletId, updatedAt: new Date() })
      .where(eq(profissionais.id, profissional.id));

    return { podeReceber: true, walletId };
  }

  private async recuperarWalletId(
    client: AsaasClient,
    accountId: string,
    profissionalId: string,
  ): Promise<string> {
    const conta = await this.executar(() =>
      client.request<{ walletId: string }>('GET', `/accounts/${accountId}`),
    );

    if (!conta?.walletId) {
      throw new BadRequestException(
        'Asaas não retornou a carteira da subconta. Tente novamente.',
      );
    }

    this.logger.log(`Escrow habilitado para profissional ${profissionalId}.`);
    return conta.walletId;
  }

  private async buscarProfissional(userId: string) {
    const [profissional] = await this.db
      .select()
      .from(profissionais)
      .where(eq(profissionais.userId, userId))
      .limit(1);

    if (!profissional) throw new NotFoundException('Profissional não encontrado.');
    return profissional;
  }

  /**
   * Converte falha do Asaas em erro de request. A mensagem do gateway é
   * repassada porque descreve o campo recusado; o payload cru nunca é logado,
   * pois carrega dados pessoais.
   */
  private async executar<T>(operacao: () => Promise<T>): Promise<T> {
    try {
      return await operacao();
    } catch (erro) {
      if (erro instanceof AsaasError) {
        this.logger.warn(`Asaas recusou a operação (HTTP ${erro.status}).`);
        throw new BadRequestException(erro.message);
      }
      throw erro;
    }
  }
}
