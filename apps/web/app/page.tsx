import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <span className="chip bg-primary-tint text-primary mb-6">
        Plantões veterinários • Grande São Paulo
      </span>
      <h1 className="text-5xl font-extrabold tracking-tight text-ink">VAPT</h1>
      <p className="mt-4 max-w-sm text-center text-lg text-muted">
        Conectamos estabelecimentos e profissionais para plantões sob demanda.
      </p>
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link href="/login" className="btn btn-primary w-full">
          Entrar
        </Link>
        <Link href="/cadastro" className="btn btn-outline w-full">
          Cadastre-se
        </Link>
      </div>
    </main>
  );
}
