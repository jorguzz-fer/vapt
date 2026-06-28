import type { Metadata } from 'next';
import { RegisterProfissionalForm } from './RegisterProfissionalForm';

export const metadata: Metadata = { title: 'Cadastro Profissional — VAPT' };

export default function CadastroProfissionalPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Cadastro Profissional</h1>
        <RegisterProfissionalForm />
      </div>
    </main>
  );
}
