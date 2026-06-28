'use client';
import { useActionState } from 'react';
import { criarPlantao } from '@/app/actions/plantoes';

const TIPOS = [
  { value: 'EMERGENCIA', label: 'Emergência' },
  { value: 'FIM_DE_SEMANA', label: 'Fim de semana' },
  { value: 'FERIAS', label: 'Férias' },
  { value: 'COBERTURA_PERIODO', label: 'Cobertura de período' },
];

const PORTAS = [
  { value: 'ABERTA', label: 'Aberta — qualquer profissional pode se candidatar' },
  { value: 'FECHADA', label: 'Fechada — convite direto' },
];

const DURACOES = [
  { value: 'H12', label: '12 horas' },
  { value: 'H24', label: '24 horas' },
  { value: 'SEMANA', label: 'Semana' },
  { value: 'PERSONALIZADO', label: 'Personalizado' },
];

const ESPECIALIDADES = [
  { value: 'PEQUENOS_ANIMAIS', label: 'Pequenos animais' },
  { value: 'GRANDES_ANIMAIS', label: 'Grandes animais' },
  { value: 'EXOTICOS', label: 'Exóticos' },
  { value: 'SILVESTRES', label: 'Silvestres' },
  { value: 'GERAL', label: 'Geral' },
];

const inputClass =
  'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 bg-white';
const labelClass = 'block text-sm font-medium text-zinc-700 mb-1';

export default function NovoPlantaoForm() {
  const [state, action, pending] = useActionState(criarPlantao, undefined);

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tipo de plantão</label>
          <select name="tipo" required className={inputClass}>
            <option value="">Selecione...</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Especialidade</label>
          <select name="especialidade" required className={inputClass}>
            <option value="">Selecione...</option>
            {ESPECIALIDADES.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Duração</label>
          <select name="duracao" required className={inputClass}>
            <option value="">Selecione...</option>
            {DURACOES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Tipo de vaga</label>
          <select name="tipoPorta" required className={inputClass}>
            <option value="">Selecione...</option>
            {PORTAS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Valor proposto (R$/hora)</label>
          <input
            type="number"
            name="valorProposto"
            required
            min="0"
            step="0.01"
            placeholder="Ex: 120.00"
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Volume de pacientes <span className="text-zinc-400 font-normal">(opcional)</span>
          </label>
          <input
            type="number"
            name="volumePacientes"
            min="0"
            max="999"
            placeholder="Ex: 30"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Data e hora de início</label>
          <input
            type="datetime-local"
            name="dataInicio"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Data e hora de fim</label>
          <input
            type="datetime-local"
            name="dataFim"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>CEP</label>
          <input
            type="text"
            name="cep"
            required
            maxLength={9}
            placeholder="00000-000"
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Endereço completo</label>
          <input
            type="text"
            name="localizacao"
            required
            minLength={10}
            placeholder="Rua, número, bairro, cidade"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Observações <span className="text-zinc-400 font-normal">(opcional)</span>
        </label>
        <textarea
          name="observacoes"
          rows={3}
          maxLength={1000}
          placeholder="Informações adicionais para o profissional..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <a
          href="/estabelecimento"
          className="flex-1 text-center px-4 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? 'Publicando...' : 'Publicar plantão'}
        </button>
      </div>
    </form>
  );
}
