import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { logout } from '@/app/actions/auth';

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg">VAPT — Admin</span>
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
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Painel administrativo</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {['Usuários pendentes', 'Plantões ativos', 'Disputas abertas'].map((item) => (
            <div key={item} className="border rounded-xl p-5">
              <p className="text-sm text-zinc-500">{item}</p>
              <p className="text-3xl font-bold mt-1">0</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
