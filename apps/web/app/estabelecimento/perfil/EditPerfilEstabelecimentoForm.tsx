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
        <label htmlFor="nomeFantasia" className="field-label">
          Nome fantasia
        </label>
        <input
          id="nomeFantasia"
          name="nomeFantasia"
          type="text"
          maxLength={255}
          defaultValue={nomeFantasia ?? ''}
          placeholder="Ex: Clínica VetLife"
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="telefone" className="field-label">
          Telefone / WhatsApp
        </label>
        <input
          id="telefone"
          name="telefone"
          type="tel"
          maxLength={20}
          defaultValue={telefone ?? ''}
          placeholder="(11) 99999-9999"
          className="field-input"
        />
      </div>
      <div>
        <label htmlFor="endereco" className="field-label">
          Endereço completo
        </label>
        <input
          id="endereco"
          name="endereco"
          type="text"
          maxLength={500}
          defaultValue={endereco}
          className="field-input"
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
