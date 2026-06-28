import type { Metadata } from 'next';
import { RegisterEstabelecimentoForm } from './RegisterEstabelecimentoForm';

export const metadata: Metadata = { title: 'Cadastro Estabelecimento — VAPT' };

export default function CadastroEstabelecimentoPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Cadastro Estabelecimento</h1>
        <RegisterEstabelecimentoForm />
      </div>
    </main>
  );
}
