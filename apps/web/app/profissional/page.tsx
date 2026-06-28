import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';
import { apiRequest } from '@/lib/api';
import CandidaturaButton from './CandidaturaButton';
import AvaliarProfissionalForm from './AvaliarProfissionalForm';

const ESPECIALIDADE_LABEL: Record<string, string> = {
  PEQUENOS_ANIMAIS: 'Pequenos animais',
  GRANDES_ANIMAIS: 'Grandes animais',
  EXOTICOS: 'Exóticos',
  SILVESTRES: 'Silvestres',
  GERAL: 'Geral',
};

const TIPO_LABEL: Record<string, string> = {
  EMERGENCIA: 'Emergência',
  FIM_DE_SEMANA: 'Fim de semana',
  FERIAS: 'Férias',
  COBERTURA_PERIODO: 'Cobertura de período',
};

const CANDIDATURA_COLOR: Record<string, string> = {
  PENDENTE: 'bg-yellow-100 text-yellow-700',
  ACEITA: 'bg-green-100 text-green-700',
  REJEITADA: 'bg-red-100 text-red-600',
};

const CANDIDATURA_LABEL: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  REJEITADA: 'Rejeitada',
};

const PLANTAO_STATUS_COLOR: Record<string, string> = {
  ACEITA: 'bg-blue-100 text-blue-700',
  CONFIRMADA: 'bg-blue-100 text-blue-700',
  EM_ANDAMENTO: 'bg-yellow-100 text-yellow-700',
  CONCLUIDA: 'bg-zinc-100 text-zinc-600',
  AVALIADA: 'bg-green-100 text-green-700',
};

const PLANTAO_STATUS_LABEL: Record<string, string> = {
  ACEITA: 'Selecionado',
  CONFIRMADA: 'Confirmado',
  EM_ANDAMENTO: 'Em andamento',
  CONCLUIDA: 'Concluído — avaliar',
  AVALIADA: 'Avaliado',
};

interface Plantao {
  id: string;
  tipo: string;
  especialidade: string;
  valorProposto: string;
  cep: string;
  localizacao: string;
  dataInicio: string;
  dataFim: string;
  tipoPorta: string;
}

interface Candidatura {
  id: string;
  plantaoId: string;
  status: string;
  mensagem?: string;
  createdAt: string;
  plantaoStatus?: string;
  plantaoLocalizacao?: string;
  plantaoDataInicio?: string;
}

async function getPlantoes(): Promise<Plantao[]> {
  const res = await apiRequest('/plantoes');
  if (!res.ok) return [];
  return res.json();
}

async function getMimasCandidaturas(): Promise<Candidatura[]> {
  const res = await apiRequest('/candidaturas/minhas');
  if (!res.ok) return [];
  return res.json();
}

async function getJaAvaliou(plantaoId: string): Promise<boolean> {
  const res = await apiRequest(`/avaliacoes/plantao/${plantaoId}/minha`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.jaAvaliou ?? false;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function ProfissionalDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'PROFISSIONAL') redirect('/login');

  const [plantoes, candidaturas] = await Promise.all([
    getPlantoes(),
    getMimasCandidaturas(),
  ]);

  const candidaturaPorPlantao = new Set(candidaturas.map((c) => c.plantaoId));

  // Candidaturas ACEITA com plantão CONCLUIDA ou AVALIADA → needs rating check
  const candidaturasComPlantao = candidaturas.filter(
    (c) =>
      c.status === 'ACEITA' &&
      c.plantaoStatus &&
      ['CONCLUIDA', 'AVALIADA'].includes(c.plantaoStatus),
  );

  const jaAvaliouMap: Record<string, boolean> = {};
  await Promise.all(
    candidaturasComPlantao.map(async (c) => {
      jaAvaliouMap[c.plantaoId] = await getJaAvaliou(c.plantaoId);
    }),
  );

  const candidaturasAtivas = candidaturas.filter(
    (c) =>
      !(
        c.status === 'ACEITA' &&
        c.plantaoStatus &&
        ['CONCLUIDA', 'AVALIADA'].includes(c.plantaoStatus)
      ),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">VAPT</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{session.email}</span>
          <a href="/profissional/perfil" className="text-sm text-zinc-600 hover:text-zinc-900">
            Perfil
          </a>
          <form action={logout}>
            <button type="submit" className="text-sm text-zinc-600 hover:text-zinc-900">
              Sair
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full space-y-10">

        {/* Plantões para avaliar */}
        {candidaturasComPlantao.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Plantões para avaliar</h2>
            <div className="space-y-3">
              {candidaturasComPlantao.map((c) => (
                <div key={c.id} className="border rounded-xl p-5 bg-white">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <p className="font-medium text-zinc-900">{c.plantaoLocalizacao ?? '—'}</p>
                      {c.plantaoDataInicio && (
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatDate(c.plantaoDataInicio)}
                        </p>
                      )}
                    </div>
                    {c.plantaoStatus && (
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${PLANTAO_STATUS_COLOR[c.plantaoStatus] ?? 'bg-zinc-100 text-zinc-600'}`}
                      >
                        {PLANTAO_STATUS_LABEL[c.plantaoStatus] ?? c.plantaoStatus}
                      </span>
                    )}
                  </div>
                  {c.plantaoStatus === 'CONCLUIDA' ? (
                    <AvaliarProfissionalForm
                      plantaoId={c.plantaoId}
                      jaAvaliou={jaAvaliouMap[c.plantaoId] ?? false}
                    />
                  ) : (
                    <p className="text-xs text-green-600 mt-1">Plantão avaliado por ambas as partes.</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-bold mb-4">Plantões disponíveis</h2>
          {plantoes.length === 0 ? (
            <div className="border rounded-xl p-6 text-zinc-500 text-sm">
              Nenhum plantão aberto no momento. Aguarde novas oportunidades.
            </div>
          ) : (
            <div className="space-y-3">
              {plantoes.map((p) => (
                <div key={p.id} className="border rounded-xl p-5 bg-white hover:border-zinc-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                          {TIPO_LABEL[p.tipo] ?? p.tipo}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {ESPECIALIDADE_LABEL[p.especialidade] ?? p.especialidade}
                        </span>
                        {p.tipoPorta === 'ABERTA' && (
                          <span className="text-xs text-zinc-400">Vaga aberta</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-zinc-900 truncate">{p.localizacao}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {formatDate(p.dataInicio)} → {formatDate(p.dataFim)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-sm font-semibold text-zinc-900">
                        R$ {Number(p.valorProposto).toFixed(2)}/h
                      </p>
                      <CandidaturaButton
                        plantaoId={p.id}
                        jaCandidatou={candidaturaPorPlantao.has(p.id)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {candidaturasAtivas.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Minhas candidaturas</h2>
            <div className="space-y-2">
              {candidaturasAtivas.map((c) => (
                <div key={c.id} className="border rounded-xl px-5 py-3 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-800">
                      {c.plantaoLocalizacao ?? 'Plantão'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Enviada em {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${CANDIDATURA_COLOR[c.status] ?? 'bg-zinc-100 text-zinc-600'}`}
                  >
                    {CANDIDATURA_LABEL[c.status] ?? c.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
