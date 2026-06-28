'use client';
import { useActionState } from 'react';
import { registerProfissional } from '@/app/actions/auth';
import Link from 'next/link';

export function RegisterProfissionalForm() {
  const [state, action, pending] = useActionState(registerProfissional, undefined);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="nomeCompleto" className="block text-sm font-medium mb-1">
          Nome completo
        </label>
        <input
          id="nomeCompleto"
          name="nomeCompleto"
          type="text"
          required
          autoComplete="name"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="crmv" className="block text-sm font-medium mb-1">
          CRMV
        </label>
        <input
          id="crmv"
          name="crmv"
          type="text"
          required
          placeholder="Ex: SP-12345"
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
