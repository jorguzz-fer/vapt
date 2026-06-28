import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default async function ProfissionalDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'PROFISSIONAL') redirect('/login');

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
        <h1 className="text-2xl font-bold mb-6">Plantões disponíveis</h1>
        <div className="border rounded-xl p-6 text-zinc-500 text-sm">
          Nenhum plantão disponível na sua região ainda. Aguarde novas oportunidades.
        </div>
      </main>
    </div>
  );
}
