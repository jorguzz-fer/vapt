'use client';
import { useActionState, useState } from 'react';
import { cancelarPlantao } from '@/app/actions/plantoes';

interface Props {
  plantaoId: string;
  status: string;
}

const CANCELAVEIS = ['ABERTA', 'ACEITA', 'CONFIRMADA'];

export default function CancelarPlantaoForm({ plantaoId, status }: Props) {
  const [state, action, pending] = useActionState(cancelarPlantao, undefined);
  const [confirmar, setConfirmar] = useState(false);

  if (!CANCELAVEIS.includes(status)) return null;

  if (state === null) {
    return (
      <div className="border rounded-xl p-4 bg-red-50 border-red-200 text-sm text-red-700">
        Plantão cancelado.
      </div>
    );
  }

  if (!confirmar) {
    return (
      <button
        onClick={() => setConfirmar(true)}
        className="text-sm text-red-600 hover:text-red-800 underline underline-offset-2"
      >
        Cancelar plantão
      </button>
    );
  }

  return (
    <div className="border rounded-xl p-5 bg-white border-red-200">
      <h3 className="font-semibold text-zinc-900 mb-3">Confirmar cancelamento</h3>
      <form action={action} className="space-y-3">
        <input type="hidden" name="plantaoId" value={plantaoId} />
        <div>
          <label className="block text-sm text-zinc-600 mb-1">
            Motivo <span className="text-zinc-400">(opcional)</span>
          </label>
          <textarea
            name="motivo"
            rows={2}
            maxLength={500}
            placeholder="Ex: profissional próprio disponível"
            className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
          />
        </div>
        {state?.error && (
          <p className="text-xs text-red-600">{state.error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
          >
            {pending ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmar(false)}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}
