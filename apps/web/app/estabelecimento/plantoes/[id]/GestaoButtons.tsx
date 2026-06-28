'use client';
import { useActionState } from 'react';
import { aceitarCandidatura, rejeitarCandidatura } from '@/app/actions/candidaturas';

interface Props {
  candidaturaId: string;
  plantaoId: string;
  statusCandidatura: string;
  statusPlantao: string;
}

export default function GestaoButtons({
  candidaturaId,
  plantaoId,
  statusCandidatura,
  statusPlantao,
}: Props) {
  const [acceptState, acceptAction, acceptPending] = useActionState(aceitarCandidatura, undefined);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejeitarCandidatura, undefined);

  if (statusCandidatura !== 'PENDENTE' || statusPlantao !== 'ABERTA') {
    const color =
      statusCandidatura === 'ACEITA'
        ? 'bg-green-100 text-green-700'
        : statusCandidatura === 'REJEITADA'
          ? 'bg-red-100 text-red-600'
          : 'bg-zinc-100 text-zinc-600';
    const label =
      statusCandidatura === 'ACEITA'
        ? 'Aceita'
        : statusCandidatura === 'REJEITADA'
          ? 'Rejeitada'
          : statusCandidatura;
    return (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${color}`}>
        {label}
      </span>
    );
  }

  const error = acceptState?.error ?? rejectState?.error;

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <form action={rejectAction}>
          <input type="hidden" name="candidaturaId" value={candidaturaId} />
          <input type="hidden" name="plantaoId" value={plantaoId} />
          <button
            type="submit"
            disabled={rejectPending || acceptPending}
            className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {rejectPending ? 'Rejeitando...' : 'Rejeitar'}
          </button>
        </form>
        <form action={acceptAction}>
          <input type="hidden" name="candidaturaId" value={candidaturaId} />
          <input type="hidden" name="plantaoId" value={plantaoId} />
          <button
            type="submit"
            disabled={acceptPending || rejectPending}
            className="text-xs px-3 py-1.5 bg-zinc-900 text-white rounded-full hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {acceptPending ? 'Aceitando...' : 'Aceitar'}
          </button>
        </form>
      </div>
    </div>
  );
}
