'use client';
import { useActionState } from 'react';
import { avaliar } from '@/app/actions/avaliacoes';

function StarRating({ name }: { name: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <label key={v} className="cursor-pointer">
          <input type="radio" name={name} value={v} required className="sr-only" />
          <span className="text-2xl select-none hover:text-star">★</span>
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
        <p className="text-xs text-muted mb-1">Sua nota (1–5)</p>
        <StarRating name="nota" />
      </div>
      <textarea
        name="comentario"
        rows={2}
        maxLength={1000}
        placeholder="Comentário opcional..."
        className="field-input text-xs resize-none"
      />
      {state?.error && (
        <p className="text-xs text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? 'Enviando...' : 'Enviar avaliação'}
      </button>
    </form>
  );
}
