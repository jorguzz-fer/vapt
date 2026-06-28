import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default async function EstabelecimentoDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'ESTABELECIMENTO') redirect('/login');

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
          <button className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors">
            + Novo plantão
          </button>
        </div>
        <div className="border rounded-xl p-6 text-zinc-500 text-sm">
          Nenhum plantão publicado ainda. Clique em &ldquo;Novo plantão&rdquo; para começar.
        </div>
      </main>
    </div>
  );
}
