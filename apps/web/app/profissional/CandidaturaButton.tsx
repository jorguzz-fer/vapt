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
        <p className="text-xs text-danger mb-1">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? 'Enviando...' : 'Candidatar'}
      </button>
    </form>
  );
}
