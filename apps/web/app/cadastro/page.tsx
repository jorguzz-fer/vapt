import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Criar conta — VAPT' };

export default function CadastroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Criar conta</h1>
        <p className="text-center text-muted mb-8">Qual é o seu perfil?</p>
        <div className="space-y-3">
          <Link
            href="/cadastro/profissional"
            className="card block w-full p-5 transition-colors hover:border-primary hover:bg-primary-tint"
          >
            <p className="font-semibold text-ink">Profissional</p>
            <p className="text-sm text-muted mt-1">
              Veterinário, especialista ou técnico
            </p>
          </Link>
          <Link
            href="/cadastro/estabelecimento"
            className="card block w-full p-5 transition-colors hover:border-primary hover:bg-primary-tint"
          >
            <p className="font-semibold text-ink">Estabelecimento</p>
            <p className="text-sm text-muted mt-1">
              Clínica, hospital ou consultório
            </p>
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
