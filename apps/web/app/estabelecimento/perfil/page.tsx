import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import EditPerfilEstabelecimentoForm from './EditPerfilEstabelecimentoForm';

interface PerfilEstabelecimento {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string | null;
  cnpj: string;
  cep: string;
  endereco: string;
  telefone?: string | null;
  email: string;
}

async function getPerfil(): Promise<PerfilEstabelecimento | null> {
  const res = await apiRequest('/perfil');
  if (!res.ok) return null;
  return res.json();
}

export default async function PerfilEstabelecimentoPage() {
  const session = await getSession();
  if (!session || session.role !== 'ESTABELECIMENTO') redirect('/login');

  const perfil = await getPerfil();
  if (!perfil) redirect('/estabelecimento');

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/estabelecimento" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Dashboard
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Perfil do estabelecimento</h1>

        {/* Info fixa */}
        <div className="border rounded-xl p-6 bg-white mb-6">
          <p className="text-xl font-semibold text-zinc-900">
            {perfil.nomeFantasia ?? perfil.razaoSocial}
          </p>
          {perfil.nomeFantasia && (
            <p className="text-sm text-zinc-500 mt-0.5">{perfil.razaoSocial}</p>
          )}
          <p className="text-sm text-zinc-500 mt-1">{perfil.email}</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-600 mt-4">
            <div>
              <span className="text-xs text-zinc-400 block">CNPJ</span>
              {perfil.cnpj}
            </div>
            <div>
              <span className="text-xs text-zinc-400 block">CEP</span>
              {perfil.cep}
            </div>
          </div>
        </div>

        {/* Campos editáveis */}
        <div className="border rounded-xl p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">Editar perfil</h2>
          <EditPerfilEstabelecimentoForm
            nomeFantasia={perfil.nomeFantasia}
            telefone={perfil.telefone}
            endereco={perfil.endereco}
          />
        </div>
      </div>
    </div>
  );
}
