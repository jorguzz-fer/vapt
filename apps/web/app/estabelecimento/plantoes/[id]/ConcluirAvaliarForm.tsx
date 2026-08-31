'use client';
import { useActionState } from 'react';
import { concluirPlantao, avaliar } from '@/app/actions/avaliacoes';

interface Props {
  plantaoId: string;
  status: string;
  jaAvaliou: boolean;
}

function StarRating({ name }: { name: string }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((v) => (
        <label key={v} className="cursor-pointer">
          <input type="radio" name={name} value={v} required className="sr-only" />
          <span className="text-2xl select-none hover:text-star peer-checked:text-star">★</span>
        </label>
      ))}
    </div>
  );
}

export default function ConcluirAvaliarForm({ plantaoId, status, jaAvaliou }: Props) {
  const [concluirState, concluirAction, concluirPending] = useActionState(concluirPlantao, undefined);
  const [avaliarState, avaliarAction, avaliarPending] = useActionState(avaliar, undefined);

  if (status === 'AVALIADA') {
    return (
      <div className="border rounded-xl p-4 bg-green-50 border-green-200 text-sm text-green-700">
        Plantão concluído e avaliado por ambas as partes.
      </div>
    );
  }

  if (status === 'CONCLUIDA' && !jaAvaliou) {
    return (
      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-3">Avaliar plantão</h3>
        <form action={avaliarAction} className="space-y-3">
          <input type="hidden" name="plantaoId" value={plantaoId} />
          <div>
            <p className="text-sm text-muted mb-1">Nota (1–5)</p>
            <StarRating name="nota" />
          </div>
          <div>
            <textarea
              name="comentario"
              rows={3}
              maxLength={1000}
              placeholder="Comentário opcional..."
              className="field-input resize-none"
            />
          </div>
          {avaliarState?.error && (
            <p className="text-xs text-danger">{avaliarState.error}</p>
          )}
          <button
            type="submit"
            disabled={avaliarPending}
            className="btn btn-primary w-full"
          >
            {avaliarPending ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>
      </div>
    );
  }

  if (status === 'CONCLUIDA' && jaAvaliou) {
    return (
      <div className="border rounded-xl p-4 bg-blue-50 border-blue-200 text-sm text-blue-700">
        Sua avaliação foi enviada. Aguardando avaliação da outra parte.
      </div>
    );
  }

  if (['ACEITA', 'CONFIRMADA', 'EM_ANDAMENTO'].includes(status)) {
    return (
      <div className="card p-5">
        <h3 className="font-semibold text-ink mb-1">Encerrar plantão</h3>
        <p className="text-sm text-muted mb-3">
          Marque o plantão como concluído para liberar as avaliações.
        </p>
        <form action={concluirAction}>
          <input type="hidden" name="plantaoId" value={plantaoId} />
          {concluirState?.error && (
            <p className="text-xs text-danger mb-2">{concluirState.error}</p>
          )}
          <button
            type="submit"
            disabled={concluirPending}
            className="btn btn-primary"
          >
            {concluirPending ? 'Salvando...' : 'Marcar como concluído'}
          </button>
        </form>
      </div>
    );
  }

  return null;
}
