'use client';
import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import Link from 'next/link';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-4">
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
          autoComplete="current-password"
          className="field-input"
        />
      </div>
      {state?.error && (
        <p className="text-danger text-sm">{state.error}</p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
      <p className="text-center text-sm text-muted">
        Não tem conta?{' '}
        <Link href="/cadastro" className="text-primary font-semibold hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
