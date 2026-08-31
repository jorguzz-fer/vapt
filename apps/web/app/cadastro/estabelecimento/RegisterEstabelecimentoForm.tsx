'use client';
import { useActionState } from 'react';
import { registerEstabelecimento } from '@/app/actions/auth';
import Link from 'next/link';

export function RegisterEstabelecimentoForm() {
  const [state, action, pending] = useActionState(registerEstabelecimento, undefined);
  const v = state?.values;

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="razaoSocial" className="field-label">
          Razão social
        </label>
        <input
          id="razaoSocial"
          name="razaoSocial"
          type="text"
          required
          defaultValue={v?.razaoSocial ?? ''}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="cnpj" className="field-label">
          CNPJ (somente números)
        </label>
        <input
          id="cnpj"
          name="cnpj"
          type="text"
          required
          maxLength={14}
          placeholder="00000000000000"
          defaultValue={v?.cnpj ?? ''}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="cep" className="field-label">
          CEP (somente números)
        </label>
        <input
          id="cep"
          name="cep"
          type="text"
          required
          maxLength={8}
          placeholder="00000000"
          defaultValue={v?.cep ?? ''}
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="endereco" className="field-label">
          Endereço completo
        </label>
        <input
          id="endereco"
          name="endereco"
          type="text"
          required
          defaultValue={v?.endereco ?? ''}
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
