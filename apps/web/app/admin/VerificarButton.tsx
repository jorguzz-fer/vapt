'use client';
import { useActionState } from 'react';
import { verificarProfissional } from '@/app/actions/admin';

export default function VerificarButton({ profissionalId }: { profissionalId: string }) {
  const [state, action, pending] = useActionState(verificarProfissional, undefined);

  if (state === null) {
    return (
      <span className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded-lg">
        Verificado
      </span>
    );
  }

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="profissionalId" value={profissionalId} />
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="text-xs px-3 py-1 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Verificando...' : 'Verificar'}
      </button>
    </form>
  );
}
