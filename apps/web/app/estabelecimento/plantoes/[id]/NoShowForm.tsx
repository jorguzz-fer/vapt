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
        className="text-sm text-amber-700 hover:text-amber-900 underline underline-offset-2"
      >
        Registrar no-show do profissional
      </button>
    );
  }

  return (
    <div className="border rounded-xl p-5 bg-white border-amber-200">
      <h3 className="font-semibold text-zinc-900 mb-1">Registrar no-show</h3>
      <p className="text-sm text-zinc-500 mb-3">
        Confirme que o profissional designado não compareceu. O plantão será
        encerrado como no-show.
      </p>
      <form action={action} className="space-y-3">
        <input type="hidden" name="plantaoId" value={plantaoId} />
        {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-60"
          >
            {pending ? 'Registrando...' : 'Confirmar no-show'}
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
