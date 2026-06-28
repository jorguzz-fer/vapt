import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Criar conta — VAPT' };

export default function CadastroPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Criar conta</h1>
        <p className="text-center text-zinc-500 mb-8">Qual é o seu perfil?</p>
        <div className="space-y-3">
          <Link
            href="/cadastro/profissional"
            className="block w-full p-5 border-2 border-zinc-200 rounded-xl hover:border-zinc-900 transition-colors"
          >
            <p className="font-semibold">Profissional</p>
            <p className="text-sm text-zinc-500 mt-1">
              Veterinário, especialista ou técnico
            </p>
          </Link>
          <Link
            href="/cadastro/estabelecimento"
            className="block w-full p-5 border-2 border-zinc-200 rounded-xl hover:border-zinc-900 transition-colors"
          >
            <p className="font-semibold">Estabelecimento</p>
            <p className="text-sm text-zinc-500 mt-1">
              Clínica, hospital ou consultório
            </p>
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-zinc-900 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
