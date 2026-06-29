import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold tracking-tight">VAPT</h1>
      <p className="mt-4 text-lg text-zinc-600">
        Plantões veterinários sob demanda
      </p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/login"
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-center font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Entrar
        </Link>
        <Link
          href="/cadastro"
          className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-center font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
        >
          Cadastre-se
        </Link>
      </div>
    </main>
  );
}
