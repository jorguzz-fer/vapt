import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import NovoPlantaoForm from './NovoPlantaoForm';

export default async function NovoPlantaoPage() {
  const session = await getSession();
  if (!session || session.role !== 'ESTABELECIMENTO') redirect('/login');

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/estabelecimento" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">Novo plantão</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Preencha os dados do plantão para publicar e receber candidaturas.
          </p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <NovoPlantaoForm />
        </div>
      </div>
    </div>
  );
}
