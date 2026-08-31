'use client';
import { useActionState } from 'react';
import { atualizarPerfilProfissional } from '@/app/actions/perfil';

const ESPECIALIDADE_OPTIONS = [
  { value: 'PEQUENOS_ANIMAIS', label: 'Pequenos animais' },
  { value: 'GRANDES_ANIMAIS', label: 'Grandes animais' },
  { value: 'EXOTICOS', label: 'Exóticos' },
  { value: 'SILVESTRES', label: 'Silvestres' },
  { value: 'GERAL', label: 'Geral' },
];

interface Props {
  especialidade?: string | null;
  bio?: string | null;
}

export default function EditPerfilProfissionalForm({ especialidade, bio }: Props) {
  const [state, action, pending] = useActionState(atualizarPerfilProfissional, undefined);

  if (state === null) {
    return (
      <div className="border rounded-xl p-4 bg-green-50 border-green-200 text-sm text-green-700">
        Perfil atualizado com sucesso.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="especialidade" className="field-label">
          Especialidade
        </label>
        <select
          id="especialidade"
          name="especialidade"
          defaultValue={especialidade ?? ''}
          className="field-input"
        >
          <option value="">Selecione...</option>
          {ESPECIALIDADE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bio" className="field-label">
          Bio <span className="text-muted font-normal">(até 500 caracteres)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={bio ?? ''}
          placeholder="Descreva sua experiência, especialidades e diferenciais..."
          className="field-input resize-none"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </form>
  );
}
