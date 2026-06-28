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
          <span className="text-2xl select-none hover:text-yellow-400 peer-checked:text-yellow-400">★</span>
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
      <div className="border rounded-xl p-5 bg-white">
        <h3 className="font-semibold text-zinc-900 mb-3">Avaliar plantão</h3>
        <form action={avaliarAction} className="space-y-3">
          <input type="hidden" name="plantaoId" value={plantaoId} />
          <div>
            <p className="text-sm text-zinc-600 mb-1">Nota (1–5)</p>
            <StarRating name="nota" />
          </div>
          <div>
            <textarea
              name="comentario"
              rows={3}
              maxLength={1000}
              placeholder="Comentário opcional..."
              className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
            />
          </div>
          {avaliarState?.error && (
            <p className="text-xs text-red-600">{avaliarState.error}</p>
          )}
          <button
            type="submit"
            disabled={avaliarPending}
            className="w-full py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60"
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
      <div className="border rounded-xl p-5 bg-white">
        <h3 className="font-semibold text-zinc-900 mb-1">Encerrar plantão</h3>
        <p className="text-sm text-zinc-500 mb-3">
          Marque o plantão como concluído para liberar as avaliações.
        </p>
        <form action={concluirAction}>
          <input type="hidden" name="plantaoId" value={plantaoId} />
          {concluirState?.error && (
            <p className="text-xs text-red-600 mb-2">{concluirState.error}</p>
          )}
          <button
            type="submit"
            disabled={concluirPending}
            className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60"
          >
            {concluirPending ? 'Salvando...' : 'Marcar como concluído'}
          </button>
        </form>
      </div>
    );
  }

  return null;
}
