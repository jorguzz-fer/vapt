'use client';
import { useActionState } from 'react';
import { atualizarPerfilEstabelecimento } from '@/app/actions/perfil';

interface Props {
  nomeFantasia?: string | null;
  telefone?: string | null;
  endereco: string;
}

export default function EditPerfilEstabelecimentoForm({ nomeFantasia, telefone, endereco }: Props) {
  const [state, action, pending] = useActionState(atualizarPerfilEstabelecimento, undefined);

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
        <label htmlFor="nomeFantasia" className="block text-sm font-medium mb-1">
          Nome fantasia
        </label>
        <input
          id="nomeFantasia"
          name="nomeFantasia"
          type="text"
          maxLength={255}
          defaultValue={nomeFantasia ?? ''}
          placeholder="Ex: Clínica VetLife"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="telefone" className="block text-sm font-medium mb-1">
          Telefone / WhatsApp
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          maxLength={20}
          defaultValue={telefone ?? ''}
          placeholder="(11) 99999-9999"
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>
      <div>
        <label htmlFor="endereco" className="block text-sm font-medium mb-1">
          Endereço completo
        </label>
        <input
          id="endereco"
          name="endereco"
          type="text"
          maxLength={500}
          defaultValue={endereco}
          className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900"
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
