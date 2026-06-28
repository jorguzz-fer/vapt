import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import GestaoButtons from './GestaoButtons';
import ConcluirAvaliarForm from './ConcluirAvaliarForm';

const STATUS_LABEL: Record<string, string> = {
  ABERTA: 'Aberta',
  ACEITA: 'Profissional selecionado',
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
  CANCELADA: 'bg-red-100 text-red-600',
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
  tipoPorta: string;
  duracao: string;
  especialidade: string;
  valorProposto: string;
  cep: string;
  localizacao: string;
  observacoes?: string;
  dataInicio: string;
  dataFim: string;
}

interface CandidaturaComProfissional {
  id: string;
  plantaoId: string;
  profissionalId: string;
  status: string;
  mensagem?: string;
  createdAt: string;
  nomeCompleto: string;
  crmv: string;
  especialidade?: string;
  bio?: string;
}

async function getPlantao(id: string): Promise<Plantao | null> {
  const res = await apiRequest(`/plantoes/${id}`);
  if (!res.ok) return null;
  return res.json();
}

async function getCandidaturas(id: string): Promise<CandidaturaComProfissional[]> {
  const res = await apiRequest(`/plantoes/${id}/candidaturas`);
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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function PlantaoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'ESTABELECIMENTO') redirect('/login');

  const { id } = await params;
  const [plantao, candidaturas, jaAvaliou] = await Promise.all([
    getPlantao(id),
    getCandidaturas(id),
    getJaAvaliou(id),
  ]);

  if (!plantao) redirect('/estabelecimento');

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/estabelecimento" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Meus plantões
          </Link>
        </div>

        {/* Detalhes do plantão */}
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[plantao.status] ?? 'bg-zinc-100 text-zinc-600'}`}
              >
                {STATUS_LABEL[plantao.status] ?? plantao.status}
              </span>
              <h1 className="text-xl font-bold mt-2">{plantao.localizacao}</h1>
              <p className="text-sm text-zinc-500 mt-1">
                {ESPECIALIDADE_LABEL[plantao.especialidade] ?? plantao.especialidade}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-zinc-900">
                R$ {Number(plantao.valorProposto).toFixed(2)}/h
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-600">
            <div>
              <span className="text-xs text-zinc-400 block">Início</span>
              {formatDate(plantao.dataInicio)}
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">Fim</span>
              {formatDate(plantao.dataFim)}
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">CEP</span>
              {plantao.cep}
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">Tipo de vaga</span>
              {plantao.tipoPorta === 'ABERTA' ? 'Aberta' : 'Fechada'}
            </div>
          </div>
          {plantao.observacoes && (
            <div className="mt-4 pt-4 border-t text-sm text-zinc-600">
              <span className="text-xs text-zinc-400 block mb-1">Observações</span>
              {plantao.observacoes}
            </div>
          )}
        </div>

        {/* Concluir / Avaliar */}
        <div className="mb-6">
          <ConcluirAvaliarForm
            plantaoId={plantao.id}
            status={plantao.status}
            jaAvaliou={jaAvaliou}
          />
        </div>

        {/* Candidaturas */}
        <section>
          <h2 className="text-lg font-bold mb-3">
            Candidaturas{' '}
            <span className="text-zinc-400 font-normal text-base">({candidaturas.length})</span>
          </h2>

          {candidaturas.length === 0 ? (
            <div className="border rounded-xl p-6 text-zinc-500 text-sm bg-white">
              Nenhuma candidatura recebida ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {candidaturas.map((c) => (
                <div key={c.id} className="border rounded-xl p-5 bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900">{c.nomeCompleto}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">CRMV: {c.crmv}</p>
                      {c.especialidade && (
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {ESPECIALIDADE_LABEL[c.especialidade] ?? c.especialidade}
                        </p>
                      )}
                      {c.bio && (
                        <p className="text-sm text-zinc-600 mt-2 line-clamp-2">{c.bio}</p>
                      )}
                      {c.mensagem && (
                        <p className="text-sm text-zinc-600 mt-2 italic">&ldquo;{c.mensagem}&rdquo;</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-2">
                        Candidatou em {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <GestaoButtons
                      candidaturaId={c.id}
                      plantaoId={plantao.id}
                      statusCandidatura={c.status}
                      statusPlantao={plantao.status}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
