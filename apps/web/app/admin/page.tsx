import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { apiRequest } from '@/lib/api';
import VerificarButton from './VerificarButton';

interface Stats {
  totalUsers: number;
  totalProfissionais: number;
  profissionaisVerificados: number;
  profissionaisPendentes: number;
  totalEstabelecimentos: number;
  totalPlantoes: number;
  plantoesAbertos: number;
}

interface Profissional {
  id: string;
  nomeCompleto: string;
  crmv: string;
  especialidade?: string;
  verificado: boolean;
  backgroundCheckAprovado: boolean;
  email: string;
  createdAt: string;
}

const ESPECIALIDADE_LABEL: Record<string, string> = {
  PEQUENOS_ANIMAIS: 'Pequenos animais',
  GRANDES_ANIMAIS: 'Grandes animais',
  EXOTICOS: 'Exóticos',
  SILVESTRES: 'Silvestres',
  GERAL: 'Geral',
};

async function getStats(): Promise<Stats | null> {
  const res = await apiRequest('/admin/stats');
  if (!res.ok) return null;
  return res.json();
}

async function getProfissionais(): Promise<Profissional[]> {
  const res = await apiRequest('/admin/profissionais');
  if (!res.ok) return [];
  return res.json();
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const [stats, profissionais] = await Promise.all([getStats(), getProfissionais()]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">VAPT Admin</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{session.email}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-zinc-600 hover:text-zinc-900">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-10">

        {stats && (
          <section>
            <h2 className="text-xl font-bold mb-4">Visão geral</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <StatCard label="Usuários" value={stats.totalUsers} />
              <StatCard label="Profissionais" value={stats.totalProfissionais} />
              <StatCard label="Verificados" value={stats.profissionaisVerificados} color="text-green-600" />
              <StatCard label="Pendentes" value={stats.profissionaisPendentes} color="text-yellow-600" />
              <StatCard label="Estabelecimentos" value={stats.totalEstabelecimentos} />
              <StatCard label="Plantões" value={stats.totalPlantoes} />
              <StatCard label="Abertos" value={stats.plantoesAbertos} color="text-blue-600" />
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">
            Profissionais{' '}
            <span className="font-normal text-zinc-400 text-base">({profissionais.length})</span>
          </h2>
          {profissionais.length === 0 ? (
            <div className="border rounded-xl p-6 text-zinc-500 text-sm bg-white">
              Nenhum profissional cadastrado.
            </div>
          ) : (
            <div className="space-y-3">
              {profissionais.map((p) => (
                <div key={p.id} className="border rounded-xl p-5 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-medium text-zinc-900">{p.nomeCompleto}</p>
                        {p.verificado ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Verificado
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                            Pendente
                          </span>
                        )}
                        {p.backgroundCheckAprovado && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            Background OK
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">CRMV: {p.crmv}</p>
                      {p.especialidade && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {ESPECIALIDADE_LABEL[p.especialidade] ?? p.especialidade}
                        </p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1">{p.email}</p>
                      <p className="text-xs text-zinc-300 mt-0.5">
                        Cadastrado em {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {!p.verificado && <VerificarButton profissionalId={p.id} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color = 'text-zinc-900',
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
