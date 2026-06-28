'use client';
import { useActionState } from 'react';
import { registerEstabelecimento } from '@/app/actions/auth';
import Link from 'next/link';

export function RegisterEstabelecimentoForm() {
  const [state, action, pending] = useActionState(registerEstabelecimento, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="razaoSocial" className="block text-sm font-medium mb-1">
          Razão social
        </label>
        <input
          id="razaoSocial"
          name="razaoSocial"
          type="text"
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="cnpj" className="block text-sm font-medium mb-1">
          CNPJ (somente números)
        </label>
        <input
          id="cnpj"
          name="cnpj"
          type="text"
          required
          maxLength={14}
          placeholder="00000000000000"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="cep" className="block text-sm font-medium mb-1">
          CEP (somente números)
        </label>
        <input
          id="cep"
          name="cep"
          type="text"
          required
          maxLength={8}
          placeholder="00000000"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="endereco" className="block text-sm font-medium mb-1">
          Endereço completo
        </label>
        <input
          id="endereco"
          name="endereco"
          type="text"
          required
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      {state?.error && (
        <p className="text-red-600 text-sm">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full py-2 px-4 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Criando conta…' : 'Criar conta'}
      </button>
      <p className="text-center text-sm text-zinc-500">
        <Link href="/cadastro" className="hover:underline">
          ← Voltar
        </Link>
      </p>
    </form>
  );
}
