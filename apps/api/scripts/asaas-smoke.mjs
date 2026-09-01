#!/usr/bin/env node
/**
 * Smoke-test da integração Asaas contra o SANDBOX.
 *
 * Confere, contra o gateway de verdade, o que os testes unitários só conseguem
 * simular: se a chave autentica, se a criação de subconta devolve walletId e se
 * a Conta Escrow aceita ser habilitada.
 *
 * Uso:
 *   ASAAS_API_KEY='$aact_hmlg_...' \
 *   ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3 \
 *   node apps/api/scripts/asaas-smoke.mjs
 *
 * Cria uma subconta descartável a cada execução — o sandbox permite 20 por dia.
 * NÃO aponte para produção.
 */

const apiKey = process.env.ASAAS_API_KEY;
const baseUrl = (process.env.ASAAS_BASE_URL ?? '').replace(/\/+$/, '');

if (!apiKey || !baseUrl) {
  console.error('Defina ASAAS_API_KEY e ASAAS_BASE_URL.');
  process.exit(1);
}

if (!baseUrl.includes('sandbox')) {
  console.error(
    `ASAAS_BASE_URL não parece ser sandbox (${baseUrl}). Abortando para não tocar em produção.`,
  );
  process.exit(1);
}

async function chamar(method, path, body) {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      access_token: apiKey,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const texto = await res.text();
  let payload;
  try {
    payload = texto ? JSON.parse(texto) : undefined;
  } catch {
    payload = texto;
  }
  return { ok: res.ok, status: res.status, payload };
}

const sufixo = Date.now();

console.log(`Base URL: ${baseUrl}\n`);

// 1 — a chave autentica?
console.log('1) Autenticação…');
const auth = await chamar('GET', '/customers?limit=1');
if (!auth.ok) {
  console.error(`   ✗ HTTP ${auth.status}:`, auth.payload);
  console.error('   Verifique se a chave é do mesmo ambiente da URL.');
  process.exit(1);
}
console.log('   ✓ chave aceita pelo header access_token\n');

// 2 — criar subconta
console.log('2) Criando subconta descartável…');
const criar = await chamar('POST', '/accounts', {
  name: `VAPT Smoke ${sufixo}`,
  email: `vapt-smoke-${sufixo}@example.com`,
  cpfCnpj: process.env.SMOKE_CPF ?? '24971563792',
  mobilePhone: '11999998888',
  incomeValue: 8000,
  postalCode: '01310100',
  address: 'Avenida Paulista',
  addressNumber: '1000',
  province: 'Bela Vista',
});

if (!criar.ok) {
  console.error(`   ✗ HTTP ${criar.status}:`, criar.payload);
  console.error('   Se for CPF inválido, passe um CPF de teste em SMOKE_CPF.');
  process.exit(1);
}

const { id: accountId, walletId } = criar.payload;
console.log(`   ✓ subconta criada — id=${accountId}`);
console.log(`   ✓ walletId=${walletId}`);
console.log(
  criar.payload.apiKey
    ? '   ℹ a resposta traz apiKey da subconta; a aplicação a descarta de propósito\n'
    : '\n',
);

// 3 — habilitar Conta Escrow
console.log('3) Habilitando Conta Escrow…');
const escrow = await chamar('POST', `/accounts/${accountId}/escrow`, {
  enabled: true,
  daysToExpire: 7,
});

if (!escrow.ok) {
  console.error(`   ✗ HTTP ${escrow.status}:`, escrow.payload);
  console.error(
    '   A Conta Escrow pode exigir habilitação comercial junto ao Asaas.',
  );
  process.exit(1);
}
console.log('   ✓ escrow habilitado (daysToExpire=7)\n');

console.log('Smoke-test concluído. O contrato usado pela aplicação confere.');
