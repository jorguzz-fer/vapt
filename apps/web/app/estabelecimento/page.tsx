import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/actions/auth';
import { apiRequest } from '@/lib/api';

const STATUS_LABEL: Record<string, string> = {
  ABERTA: 'Aberta',
  ACEITA: 'Aceita',
  CONFIRMADA: 'Confirmada',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluída',
  AVALIADA: 'Avaliada',
  CANCELADA: 'Cancelada',
  NO_SHOW: 'No-show',
};

const STATUS_COLOR: Record<string, string> = {
  ABERTA: 'bg-green-100 text-green-700',
  ACEITA: 'bg-blue-100 text-blue-700',
  CONFIRMADA: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-700',
  CONCLUIDA: 'bg-zinc-100 text-zinc-600',
  AVALIADA: 'bg-zinc-100 text-zinc-600',
  CANCELADA: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-red-100 text-red-600',
};

const ESPECIALIDADE_LABEL: Record<string, string> = {
  PEQUENOS_ANIMAIS: 'Pequenos animais',
  GRANDES_ANIMAIS: 'Grandes animais',
  EXOTICOS: 'Exóticos',
  SILVESTRES: 'Silvestres',
  GERAL: 'Geral',
};

interface Plantao {
  id: string;
  status: string;
  tipo: string;
  especialidade: string;
  valorProposto: string;
  dataInicio: string;
  dataFim: string;
  localizacao: string;
  createdAt: string;
}

async function getMeusPlantoes(): Promise<Plantao[]> {
  const res = await apiRequest('/plantoes/meus');
  if (!res.ok) return [];
  return res.json();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function EstabelecimentoDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'ESTABELECIMENTO') redirect('/login');

  const plantoes = await getMeusPlantoes();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">VAPT</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{session.email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meus plantões</h1>
          <Link
            href="/estabelecimento/plantoes/novo"
            className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors"
          >
            + Novo plantão
          </Link>
        </div>

        {plantoes.length === 0 ? (
          <div className="border rounded-xl p-8 text-center text-zinc-500 text-sm">
            <p className="mb-3">Nenhum plantão publicado ainda.</p>
            <Link
              href="/estabelecimento/plantoes/novo"
              className="inline-block px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Publicar primeiro plantão
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {plantoes.map((p) => (
              <div key={p.id} className="border rounded-xl p-5 bg-white hover:border-zinc-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                      >
                        {STATUS_LABEL[p.status] ?? p.status}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {ESPECIALIDADE_LABEL[p.especialidade] ?? p.especialidade}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 truncate">{p.localizacao}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDate(p.dataInicio)} → {formatDate(p.dataFim)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-zinc-900">
                      R$ {Number(p.valorProposto).toFixed(2)}/h
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
