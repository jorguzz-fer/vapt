'use client';
import { useActionState } from 'react';
import { registerProfissional } from '@/app/actions/auth';
import Link from 'next/link';

export function RegisterProfissionalForm() {
  const [state, action, pending] = useActionState(registerProfissional, undefined);
  const v = state?.values;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="nomeCompleto" className="field-label">
          Nome completo
        </label>
        <input
          id="nomeCompleto"
          name="nomeCompleto"
          type="text"
          required
          autoComplete="name"
          defaultValue={v?.nomeCompleto ?? ''}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="crmv" className="field-label">
          CRMV
        </label>
        <input
          id="crmv"
          name="crmv"
          type="text"
          required
          placeholder="Ex: SP-12345"
          defaultValue={v?.crmv ?? ''}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="email" className="field-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={v?.email ?? ''}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="password" className="field-label">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="field-input"
        />
      </div>
      {state?.error && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? 'Criando conta…' : 'Criar conta'}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/cadastro" className="hover:underline">
          ← Voltar
        </Link>
      </p>
    </form>
  );
}
