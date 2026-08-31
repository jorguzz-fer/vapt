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
        className="text-sm text-danger hover:opacity-80 underline underline-offset-2"
      >
        Cancelar plantão
      </button>
    );
  }

  return (
    <div className="card p-5 border-red-200">
      <h3 className="font-semibold text-ink mb-3">Confirmar cancelamento</h3>
      <form action={action} className="space-y-3">
        <input type="hidden" name="plantaoId" value={plantaoId} />
        <div>
          <label className="field-label">
            Motivo <span className="text-muted font-normal">(opcional)</span>
          </label>
          <textarea
            name="motivo"
            rows={2}
            maxLength={500}
            placeholder="Ex: profissional próprio disponível"
            className="field-input resize-none"
          />
        </div>
        {state?.error && (
          <p className="text-xs text-danger">{state.error}</p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn btn-danger"
          >
            {pending ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmar(false)}
            className="btn btn-ghost"
          >
            Voltar
          </button>
        </div>
      </form>
    </div>
  );
}
