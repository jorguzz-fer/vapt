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
        <label htmlFor="especialidade" className="block text-sm font-medium mb-1">
          Especialidade
        </label>
        <select
          id="especialidade"
          name="especialidade"
          defaultValue={especialidade ?? ''}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white"
        >
          <option value="">Selecione...</option>
          {ESPECIALIDADE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-1">
          Bio <span className="text-zinc-400 font-normal">(até 500 caracteres)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={500}
          defaultValue={bio ?? ''}
          placeholder="Descreva sua experiência, especialidades e diferenciais..."
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="px-6 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </form>
  );
}
