/**
 * Cliente HTTP do Asaas.
 *
 * Sem decorators do Nest de propósito: é uma classe simples, injetável por
 * construtor, para poder ser exercitada em teste com um `fetch` falso.
 *
 * Autenticação: o Asaas usa o header `access_token`, não `Authorization:
 * Bearer`. A chave precisa ser do mesmo ambiente da baseUrl (sandbox x
 * produção) — chave trocada retorna 401.
 */

export interface AsaasClientOptions {
  apiKey: string;
  baseUrl: string;
  /** Injetável para teste. Default: fetch global. */
  fetchFn?: typeof fetch;
}

export interface AsaasErroDetalhe {
  code: string;
  description: string;
}

export class AsaasError extends Error {
  // Campos declarados explicitamente: o runner de teste do Node roda em modo
  // strip-only, que não aceita parameter properties.
  readonly status: number;
  readonly erros: AsaasErroDetalhe[];

  constructor(message: string, status: number, erros: AsaasErroDetalhe[] = []) {
    super(message);
    this.name = 'AsaasError';
    this.status = status;
    this.erros = erros;
  }
}

/** Dados exigidos pelo Asaas em POST /v3/accounts. */
export interface CriarSubcontaInput {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  incomeValue: number;
  postalCode: string;
  address: string;
  addressNumber: string;
  province: string;
}

export interface Subconta {
  id: string;
  walletId: string;
}

export class AsaasClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(options: AsaasClientOptions) {
    if (!options.apiKey) throw new Error('ASAAS_API_KEY não configurada.');
    if (!options.baseUrl) throw new Error('ASAAS_BASE_URL não configurada.');

    this.apiKey = options.apiKey;
    // Normaliza para que baseUrl com ou sem barra final gere a mesma URL.
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const response = await this.fetchFn(`${this.baseUrl}${path}`, {
      method,
      headers: {
        access_token: this.apiKey,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const texto = await response.text();
    let payload: unknown = undefined;
    if (texto) {
      try {
        payload = JSON.parse(texto);
      } catch {
        // Resposta não-JSON (ex: HTML de erro de gateway) cai no throw abaixo.
      }
    }

    if (!response.ok) {
      const erros = extrairErros(payload);
      const detalhe = erros.map((e) => e.description).join('; ');
      throw new AsaasError(
        detalhe || `Asaas respondeu ${response.status} em ${method} ${path}.`,
        response.status,
        erros,
      );
    }

    return payload as T;
  }

  /**
   * Cria a subconta do profissional.
   *
   * A resposta do Asaas inclui uma `apiKey` da subconta. Ela é
   * deliberadamente descartada: o split e o escrow são operados com a chave da
   * conta raiz, então guardá-la só aumentaria a superfície de vazamento.
   */
  async criarSubconta(input: CriarSubcontaInput): Promise<Subconta> {
    const criada = await this.request<{ id: string; walletId: string }>(
      'POST',
      '/accounts',
      input,
    );

    return { id: criada.id, walletId: criada.walletId };
  }

  /**
   * Habilita a Conta Escrow na subconta: os valores recebidos ficam
   * bloqueados até liberação, e `daysToExpire` é a liberação automática de
   * segurança caso ninguém libere manualmente.
   */
  async configurarEscrow(
    accountId: string,
    daysToExpire: number,
  ): Promise<void> {
    await this.request('POST', `/accounts/${accountId}/escrow`, {
      enabled: true,
      daysToExpire,
    });
  }
}

function extrairErros(payload: unknown): AsaasErroDetalhe[] {
  if (
    payload &&
    typeof payload === 'object' &&
    'errors' in payload &&
    Array.isArray((payload as { errors: unknown }).errors)
  ) {
    return (payload as { errors: AsaasErroDetalhe[] }).errors;
  }
  return [];
}
