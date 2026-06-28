'use client';
import { useActionState } from 'react';
import { avaliar } from '@/app/actions/avaliacoes';

function StarRating({ name }: { name: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <label key={v} className="cursor-pointer">
          <input type="radio" name={name} value={v} required className="sr-only" />
          <span className="text-2xl select-none hover:text-yellow-400">★</span>
        </label>
      ))}
    </div>
  );
}

interface Props {
  plantaoId: string;
  jaAvaliou: boolean;
}

export default function AvaliarProfissionalForm({ plantaoId, jaAvaliou }: Props) {
  const [state, action, pending] = useActionState(avaliar, undefined);

  if (jaAvaliou || state === null) {
    return (
      <p className="text-xs text-blue-600 mt-2">
        Avaliação enviada. Aguardando avaliação do estabelecimento.
      </p>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="plantaoId" value={plantaoId} />
      <div>
        <p className="text-xs text-zinc-500 mb-1">Sua nota (1–5)</p>
        <StarRating name="nota" />
      </div>
      <textarea
        name="comentario"
        rows={2}
        maxLength={1000}
        placeholder="Comentário opcional..."
        className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
      />
      {state?.error && (
        <p className="text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-1.5 bg-zinc-900 text-white text-xs rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}
