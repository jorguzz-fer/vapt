import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AsaasClient, AsaasError } from './asaas.client.ts';

interface ChamadaCapturada {
  url: string;
  init: RequestInit;
}

/** fetch falso que grava a chamada e devolve a resposta programada. */
function fakeFetch(
  resposta: { status: number; body?: unknown; texto?: string },
  capturadas: ChamadaCapturada[],
): typeof fetch {
  return (async (url: string, init: RequestInit = {}) => {
    capturadas.push({ url, init });
    const texto =
      resposta.texto ??
      (resposta.body === undefined ? '' : JSON.stringify(resposta.body));
    return {
      ok: resposta.status >= 200 && resposta.status < 300,
      status: resposta.status,
      text: async () => texto,
    };
  }) as unknown as typeof fetch;
}

const OPCOES = { apiKey: '$aact_hmlg_chave', baseUrl: 'https://api-sandbox.asaas.com/v3' };

const SUBCONTA_INPUT = {
  name: 'Dra. Ana Souza',
  email: 'ana@exemplo.com',
  cpfCnpj: '12345678901',
  mobilePhone: '11999998888',
  incomeValue: 8000,
  postalCode: '01310100',
  address: 'Av. Paulista',
  addressNumber: '1000',
  province: 'Bela Vista',
};

describe('AsaasClient', () => {
  it('autentica pelo header access_token, não por Bearer', async () => {
    const chamadas: ChamadaCapturada[] = [];
    const client = new AsaasClient({
      ...OPCOES,
      fetchFn: fakeFetch({ status: 200, body: { id: 'acc_1', walletId: 'w_1' } }, chamadas),
    });

    await client.criarSubconta(SUBCONTA_INPUT);

    const headers = chamadas[0].init.headers as Record<string, string>;
    assert.equal(headers.access_token, '$aact_hmlg_chave');
    assert.equal(headers.Authorization, undefined);
  });

  it('monta a URL a partir da baseUrl, tolerando barra final', async () => {
    const chamadas: ChamadaCapturada[] = [];
    const client = new AsaasClient({
      apiKey: 'k',
      baseUrl: 'https://api-sandbox.asaas.com/v3/',
      fetchFn: fakeFetch({ status: 200, body: { id: 'a', walletId: 'w' } }, chamadas),
    });

    await client.criarSubconta(SUBCONTA_INPUT);

    assert.equal(chamadas[0].url, 'https://api-sandbox.asaas.com/v3/accounts');
  });

  it('envia os campos exigidos pelo Asaas no corpo', async () => {
    const chamadas: ChamadaCapturada[] = [];
    const client = new AsaasClient({
      ...OPCOES,
      fetchFn: fakeFetch({ status: 200, body: { id: 'a', walletId: 'w' } }, chamadas),
    });

    await client.criarSubconta(SUBCONTA_INPUT);

    const corpo = JSON.parse(chamadas[0].init.body as string);
    for (const campo of [
      'name',
      'email',
      'cpfCnpj',
      'mobilePhone',
      'incomeValue',
      'postalCode',
      'address',
      'addressNumber',
      'province',
    ]) {
      assert.ok(corpo[campo] !== undefined, `campo obrigatório ausente: ${campo}`);
    }
  });

  it('não propaga a apiKey da subconta devolvida pelo Asaas', async () => {
    const client = new AsaasClient({
      ...OPCOES,
      fetchFn: fakeFetch(
        { status: 200, body: { id: 'acc_1', walletId: 'w_1', apiKey: '$aact_hmlg_segredo' } },
        [],
      ),
    });

    const subconta = await client.criarSubconta(SUBCONTA_INPUT);

    assert.deepEqual(subconta, { id: 'acc_1', walletId: 'w_1' });
    assert.ok(!JSON.stringify(subconta).includes('segredo'));
  });

  it('habilita o escrow com o prazo de liberação automática', async () => {
    const chamadas: ChamadaCapturada[] = [];
    const client = new AsaasClient({
      ...OPCOES,
      fetchFn: fakeFetch({ status: 200, body: {} }, chamadas),
    });

    await client.configurarEscrow('acc_1', 7);

    assert.equal(chamadas[0].url, 'https://api-sandbox.asaas.com/v3/accounts/acc_1/escrow');
    assert.deepEqual(JSON.parse(chamadas[0].init.body as string), {
      enabled: true,
      daysToExpire: 7,
    });
  });

  describe('erros', () => {
    it('traduz o corpo de erro do Asaas em AsaasError com a descrição', async () => {
      const client = new AsaasClient({
        ...OPCOES,
        fetchFn: fakeFetch(
          {
            status: 400,
            body: {
              errors: [
                { code: 'invalid_cpfCnpj', description: 'CPF ou CNPJ inválido' },
              ],
            },
          },
          [],
        ),
      });

      await assert.rejects(
        () => client.criarSubconta(SUBCONTA_INPUT),
        (erro: AsaasError) => {
          assert.equal(erro.status, 400);
          assert.match(erro.message, /CPF ou CNPJ inválido/);
          assert.equal(erro.erros[0].code, 'invalid_cpfCnpj');
          return true;
        },
      );
    });

    it('falha com mensagem útil quando a resposta não é JSON', async () => {
      const client = new AsaasClient({
        ...OPCOES,
        fetchFn: fakeFetch({ status: 502, texto: '<html>Bad Gateway</html>' }, []),
      });

      await assert.rejects(
        () => client.criarSubconta(SUBCONTA_INPUT),
        (erro: AsaasError) => {
          assert.equal(erro.status, 502);
          assert.match(erro.message, /502/);
          return true;
        },
      );
    });

    it('exige chave e baseUrl na construção', () => {
      assert.throws(() => new AsaasClient({ apiKey: '', baseUrl: 'x' }), /ASAAS_API_KEY/);
      assert.throws(() => new AsaasClient({ apiKey: 'k', baseUrl: '' }), /ASAAS_BASE_URL/);
    });
  });
});
