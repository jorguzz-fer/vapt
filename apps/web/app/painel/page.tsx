import type { Metadata } from 'next';
import Link from 'next/link';
import { getSession } from '@/lib/session';

export const metadata: Metadata = { title: 'Painel de status — VAPT' };

type Estado = 'pronto' | 'parcial' | 'falta';

interface Item {
  nome: string;
  nota: string;
  estado: Estado;
  /** Sobrescreve o rótulo da pílula quando "Pronto/Parcial/Falta" não descreve bem. */
  rotulo?: string;
}

interface Dominio {
  titulo: string;
  resumo: string;
  progresso: number;
  cor: Estado;
  itens: Item[];
}

const RESUMO = {
  percentual: 63,
  prontos: 6,
  parciais: 3,
  faltando: 3,
};

const METRICAS = [
  { valor: '30', rotulo: 'endpoints REST', antes: 'era 26' },
  { valor: '14', rotulo: 'rotas web', antes: 'era 13' },
  { valor: '24', rotulo: 'testes na CI', antes: 'era 0' },
  { valor: '8', rotulo: 'tabelas', antes: 'era 7' },
];

const DOMINIOS: Dominio[] = [
  {
    titulo: 'Núcleo transacional',
    resumo: '6/6',
    progresso: 100,
    cor: 'pronto',
    itens: [
      { nome: 'Autenticação & papéis', nota: 'login, cadastro, /me, JWT + RolesGuard', estado: 'pronto' },
      { nome: 'Cadastro de estabelecimento', nota: 'CNPJ, endereço, telefone', estado: 'pronto' },
      { nome: 'Publicação & ciclo de vida do plantão', nota: 'criar, listar, detalhe, concluir, cancelar', estado: 'pronto' },
      { nome: 'Candidaturas', nota: 'candidatar, aceitar, rejeitar, atribuição', estado: 'pronto' },
      { nome: 'Avaliações (reputação bilateral)', nota: 'nota + comentário por papel do avaliador', estado: 'pronto' },
      { nome: 'Painel administrativo', nota: 'stats, listagens, verificação, configurações', estado: 'pronto' },
    ],
  },
  {
    titulo: 'Pagamento — escrow & split (Asaas)',
    resumo: '4/7 · em andamento',
    progresso: 55,
    cor: 'parcial',
    itens: [
      { nome: 'Política configurável no Admin', nota: 'comissão, captura, liberação, prazo, meios aceitos', estado: 'pronto' },
      { nome: 'Motor de cálculo do split', nota: 'centavos inteiros; invariante total = repasse + comissão', estado: 'pronto' },
      { nome: 'Cliente Asaas + subcontas', nota: 'header access_token, criação de subconta, walletId', estado: 'pronto' },
      { nome: 'Conta Escrow habilitada', nota: 'retenção com prazo de liberação automática', estado: 'pronto' },
      { nome: 'Cobrança com split', nota: 'cobrar o estabelecimento apontando a carteira do profissional', estado: 'falta', rotulo: 'Bloqueado' },
      { nome: 'Liberação do escrow na conclusão', nota: 'soltar o valor retido quando o plantão é concluído', estado: 'falta', rotulo: 'Bloqueado' },
      { nome: 'Webhooks do Asaas', nota: 'confirmação de pagamento, estorno, chargeback', estado: 'falta' },
    ],
  },
  {
    titulo: 'Geolocalização & matching',
    resumo: '0/2',
    progresso: 0,
    cor: 'falta',
    itens: [
      { nome: 'Matching por região / raio', nota: 'CEP e localização ainda são texto livre; sem distância', estado: 'falta' },
      { nome: 'Restrição geográfica (Grande SP)', nota: 'sem allow-list de cidades', estado: 'falta' },
    ],
  },
  {
    titulo: 'Confiança & compliance',
    resumo: 'parcial',
    progresso: 50,
    cor: 'parcial',
    itens: [
      { nome: 'Verificação do profissional', nota: 'aprovação manual do admin; sem documentos nem background check real', estado: 'parcial' },
      { nome: 'Antiabsenteísmo (no-show)', nota: 'status existe; falta multa/banimento automáticos', estado: 'parcial' },
      { nome: 'Privacidade por padrão', nota: 'dados pessoais exigidos pelo gateway são repassados e não persistidos', estado: 'pronto' },
    ],
  },
  {
    titulo: 'Qualidade & entrega',
    resumo: 'boa',
    progresso: 75,
    cor: 'pronto',
    itens: [
      { nome: 'Design system aplicado', nota: 'tokens e componentes reutilizáveis em todas as telas', estado: 'pronto' },
      { nome: 'Testes automatizados na CI', nota: '24 testes; job dedicado roda em toda PR', estado: 'pronto' },
      { nome: 'Régua de preço mínimo', nota: 'piso configurável validado na publicação do plantão', estado: 'pronto' },
      { nome: 'Cobertura de testes', nota: 'só cálculo do split e cliente Asaas; sem testes de fluxo', estado: 'parcial' },
      { nome: 'ADRs registrados', nota: 'docs/adr/ ainda vazio, apesar do princípio de decisões registradas', estado: 'falta' },
    ],
  },
];

const BLOQUEADORES = [
  {
    titulo: 'Definição da NF (tributário)',
    detalhe:
      'O profissional emite nota para a plataforma ou para o estabelecimento? Trava a cobrança com split e a liberação do escrow. Errar aqui obriga a refazer o repasse depois que o dinheiro circula.',
  },
  {
    titulo: 'Smoke-test contra o sandbox',
    detalhe:
      'O cliente Asaas foi mergeado sem nunca ter tocado o gateway real. Rodar o script de smoke confirma o contrato, em especial o endpoint de escrow.',
  },
  {
    titulo: 'Geo & matching',
    detalhe:
      'Sem isso o plantão não chega ao profissional certo, e a restrição à Grande São Paulo não é aplicada.',
  },
  {
    titulo: 'Política de cancelamento com plantão pago',
    detalhe: 'Reembolso integral, multa, a partir de quando? Precisa existir antes de o dinheiro circular.',
  },
];

const PILL: Record<Estado, string> = {
  pronto: 'text-success bg-success/10',
  parcial: 'text-warning bg-warning/10',
  falta: 'text-danger bg-danger/10',
};

const MARKER: Record<Estado, string> = {
  pronto: 'bg-success',
  parcial: 'bg-warning',
  falta: 'bg-danger',
};

const ROTULO: Record<Estado, string> = {
  pronto: 'Pronto',
  parcial: 'Parcial',
  falta: 'Falta',
};

export default async function PainelPage() {
  // Página aberta: sem sessão obrigatória. A sessão só decide se o atalho para
  // o admin aparece, para não deixar link morto para quem chega de fora.
  const session = await getSession();
  const ehAdmin = session?.role === 'ADMIN';

  const total = RESUMO.prontos + RESUMO.parciais + RESUMO.faltando;
  const larguras = {
    prontos: (RESUMO.prontos / total) * 100,
    parciais: (RESUMO.parciais / total) * 100,
    faltando: (RESUMO.faltando / total) * 100,
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      {ehAdmin && (
        <div className="mb-6">
          <Link href="/admin" className="text-sm text-muted hover:text-ink">
            ← Admin
          </Link>
        </div>
      )}

      <header className="border-b border-border pb-7">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-primary mb-3">
          VAPT · Marketplace de plantões veterinários
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-ink">
          Status do MVP
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          Escopo do MVP confrontado com o que está implementado no código. O núcleo
          transacional roda ponta a ponta e a fundação de pagamento está no lugar;
          falta o dinheiro circular de fato.
        </p>
      </header>

      {/* Visão geral */}
      <section className="mt-8 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Progresso do MVP
          </p>
          <p className="mt-1 text-6xl font-extrabold tracking-tight text-ink tabular-nums">
            ~{RESUMO.percentual}
            <span className="text-3xl text-muted">%</span>
          </p>
          <p className="mt-3 text-sm text-muted">
            Núcleo transacional completo, política de pagamento configurável e contas
            de recebimento com escrow.
          </p>

          <div className="mt-5 flex h-3.5 gap-0.5 overflow-hidden rounded-full bg-surface-2">
            <span className="bg-success" style={{ width: `${larguras.prontos}%` }} />
            <span className="bg-warning" style={{ width: `${larguras.parciais}%` }} />
            <span className="bg-danger" style={{ width: `${larguras.faltando}%` }} />
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted tabular-nums">
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-success" />
              {RESUMO.prontos} prontos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-warning" />
              {RESUMO.parciais} parciais
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm bg-danger" />
              {RESUMO.faltando} faltando
            </span>
            <span>de {total} no escopo</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {METRICAS.map((m) => (
            <div key={m.rotulo} className="card p-4">
              <p className="text-3xl font-extrabold tracking-tight text-ink tabular-nums">
                {m.valor}
              </p>
              <p className="mt-1 text-xs text-muted">
                {m.rotulo}{' '}
                <span className="font-mono text-[11px] text-muted/70">({m.antes})</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Domínios */}
      {DOMINIOS.map((dominio) => (
        <section key={dominio.titulo} className="mt-8">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-ink">{dominio.titulo}</h2>
            <div className="h-1.5 min-w-[120px] flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${MARKER[dominio.cor]}`}
                style={{ width: `${Math.max(dominio.progresso, 3)}%` }}
              />
            </div>
            <span className="font-mono text-xs text-muted tabular-nums">
              {dominio.resumo}
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {dominio.itens.map((item) => (
              <li
                key={item.nome}
                className="card flex items-center gap-4 px-4 py-3"
              >
                <i className={`size-2.5 shrink-0 rounded-full ${MARKER[item.estado]}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{item.nome}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.nota}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-wide ${PILL[item.estado]}`}
                >
                  {item.rotulo ?? ROTULO[item.estado]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {/* Bloqueadores */}
      <section className="mt-10 rounded-2xl border border-danger/40 bg-danger/5 p-6">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-ink">
          <i className="size-2.5 rounded-full bg-danger" />
          O que trava o MVP agora
        </h2>
        <p className="mt-1 text-sm text-muted">
          Pagamento deixou de ser &ldquo;não começado&rdquo; e virou &ldquo;bloqueado
          por uma decisão de negócio&rdquo;.
        </p>

        <ol className="mt-5 flex flex-col gap-3">
          {BLOQUEADORES.map((b, i) => (
            <li key={b.titulo} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-danger font-mono text-[11px] font-medium text-danger">
                {i + 1}
              </span>
              <p className="text-sm text-ink">
                <strong className="font-semibold">{b.titulo}.</strong>{' '}
                <span className="text-muted">{b.detalhe}</span>
              </p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-10 border-t border-border pt-5 font-mono text-xs text-muted">
        Status derivado do código-fonte e do spec · PRs mergeados até #29
      </footer>
    </main>
  );
}
