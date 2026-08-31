'use client';
import { useActionState, useState } from 'react';
import { marcarNoShow } from '@/app/actions/plantoes';

interface Props {
  plantaoId: string;
  status: string;
}

const NO_SHOW_VALIDO = ['ACEITA', 'CONFIRMADA', 'EM_ANDAMENTO'];

export default function NoShowForm({ plantaoId, status }: Props) {
  const [state, action, pending] = useActionState(marcarNoShow, undefined);
  const [confirmar, setConfirmar] = useState(false);

  if (!NO_SHOW_VALIDO.includes(status)) return null;

  if (!confirmar) {
    return (
      <button
        onClick={() => setConfirmar(true)}
        className="text-sm text-warning hover:opacity-80 underline underline-offset-2"
      >
        Registrar no-show do profissional
      </button>
    );
  }

  return (
    <div className="card p-5 border-amber-200">
      <h3 className="font-semibold text-ink mb-1">Registrar no-show</h3>
      <p className="text-sm text-muted mb-3">
        Confirme que o profissional designado não compareceu. O plantão será
        encerrado como no-show.
      </p>
      <form action={action} className="space-y-3">
        <input type="hidden" name="plantaoId" value={plantaoId} />
        {state?.error && <p className="text-xs text-danger">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="btn bg-warning text-white hover:opacity-90"
          >
            {pending ? 'Registrando...' : 'Confirmar no-show'}
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
