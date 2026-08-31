import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { apiRequest } from '@/lib/api';
import { ConfiguracoesForm, type Configuracao } from './ConfiguracoesForm';

export const metadata: Metadata = { title: 'Configurações — VAPT' };

async function getConfiguracoes(): Promise<Configuracao | null> {
  const res = await apiRequest('/configuracoes');
  if (!res.ok) return null;
  return res.json();
}

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const configuracoes = await getConfiguracoes();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-ink">Configurações de pagamento</h1>
      <p className="mt-1 text-muted">
        Política aplicada aos novos plantões. Transações já em andamento mantêm a
        política vigente no momento da cobrança.
      </p>

      <div className="mt-8">
        {configuracoes ? (
          <ConfiguracoesForm inicial={configuracoes} />
        ) : (
          <p className="text-danger">Não foi possível carregar as configurações.</p>
        )}
      </div>
    </main>
  );
}
