'use client';
import { useActionState } from 'react';
import { candidatar } from '@/app/actions/candidaturas';

interface Props {
  plantaoId: string;
  jaCandidatou: boolean;
}

export default function CandidaturaButton({ plantaoId, jaCandidatou }: Props) {
  const [state, action, pending] = useActionState(candidatar, undefined);

  if (jaCandidatou || state === null) {
    return (
      <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
        Candidatura enviada
      </span>
    );
  }

  return (
    <form action={action}>
      <input type="hidden" name="plantaoId" value={plantaoId} />
      {state?.error && (
        <p className="text-xs text-red-600 mb-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium px-3 py-1.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Enviando...' : 'Candidatar'}
      </button>
    </form>
  );
}
