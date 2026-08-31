'use client';
import { useActionState, useState } from 'react';
import { criarContaRecebimento } from '@/app/actions/conta-recebimento';

export function ContaRecebimentoForm() {
  const [state, action, pending] = useActionState(criarContaRecebimento, undefined);
  const [aberto, setAberto] = useState(false);

  if (state?.success) {
    return (
      <p className="rounded-[var(--radius)] bg-success/10 border border-success/30 p-4 text-sm text-ink">
        Conta de recebimento criada. Você já pode receber o valor dos plantões.
      </p>
    );
  }

  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="btn btn-primary">
        Cadastrar conta de recebimento
      </button>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cpfCnpj" className="field-label">
            CPF ou CNPJ
          </label>
          <input
            id="cpfCnpj"
            name="cpfCnpj"
            required
            inputMode="numeric"
            placeholder="Somente números"
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="mobilePhone" className="field-label">
            Celular (com DDD)
          </label>
          <input
            id="mobilePhone"
            name="mobilePhone"
            required
            inputMode="numeric"
            placeholder="11999998888"
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="incomeValue" className="field-label">
            Renda mensal (R$)
          </label>
          <input
            id="incomeValue"
            name="incomeValue"
            type="number"
            min="0"
            step="0.01"
            required
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="postalCode" className="field-label">
            CEP
          </label>
          <input
            id="postalCode"
            name="postalCode"
            required
            inputMode="numeric"
            placeholder="Somente números"
            className="field-input"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="address" className="field-label">
            Endereço
          </label>
          <input id="address" name="address" required className="field-input" />
        </div>
        <div>
          <label htmlFor="addressNumber" className="field-label">
            Número
          </label>
          <input
            id="addressNumber"
            name="addressNumber"
            required
            className="field-input"
          />
        </div>
        <div>
          <label htmlFor="province" className="field-label">
            Bairro
          </label>
          <input id="province" name="province" required className="field-input" />
        </div>
      </div>

      <p className="text-xs text-muted">
        Estes dados são enviados ao Asaas, nosso processador de pagamentos, para abrir
        sua conta de recebimento. A VAPT não os armazena.
      </p>

      {state?.error && <p className="text-danger text-sm">{state.error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Criando…' : 'Criar conta de recebimento'}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="btn btn-ghost"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
