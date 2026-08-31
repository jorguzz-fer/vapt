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
          : 'bg-surface-2 text-muted';
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
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <form action={rejectAction}>
          <input type="hidden" name="candidaturaId" value={candidaturaId} />
          <input type="hidden" name="plantaoId" value={plantaoId} />
          <button
            type="submit"
            disabled={rejectPending || acceptPending}
            className="btn btn-outline"
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
            className="btn btn-primary"
          >
            {acceptPending ? 'Aceitando...' : 'Aceitar'}
          </button>
        </form>
      </div>
    </div>
  );
}
