import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import EditPerfilProfissionalForm from './EditPerfilProfissionalForm';

interface PerfilProfissional {
  id: string;
  nomeCompleto: string;
  crmv: string;
  crmvAtivo: boolean;
  especialidade?: string | null;
  bio?: string | null;
  verificado: boolean;
  backgroundCheckAprovado: boolean;
  email: string;
}

async function getPerfil(): Promise<PerfilProfissional | null> {
  const res = await apiRequest('/perfil');
  if (!res.ok) return null;
  return res.json();
}

export default async function PerfilProfissionalPage() {
  const session = await getSession();
  if (!session || session.role !== 'PROFISSIONAL') redirect('/login');

  const perfil = await getPerfil();
  if (!perfil) redirect('/profissional');

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/profissional" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Meu perfil</h1>

        {/* Info fixa */}
        <div className="border rounded-xl p-6 bg-white mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-xl font-semibold text-zinc-900">{perfil.nomeCompleto}</p>
              <p className="text-sm text-zinc-500 mt-0.5">{perfil.email}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {perfil.verificado ? (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verificado</span>
              ) : (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pendente verificação</span>
              )}
              {perfil.backgroundCheckAprovado && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Background OK</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-600">
            <div>
              <span className="text-xs text-zinc-400 block">CRMV</span>
              {perfil.crmv}
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">Status CRMV</span>
              {perfil.crmvAtivo ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>

        {/* Campos editáveis */}
        <div className="border rounded-xl p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Editar perfil</h2>
          <EditPerfilProfissionalForm
            especialidade={perfil.especialidade}
            bio={perfil.bio}
          />
        </div>
      </div>
    </div>
  );
}
