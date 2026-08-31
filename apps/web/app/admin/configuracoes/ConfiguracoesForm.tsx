'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { calcularSplit, formatarBRL } from '@vapt/shared';
import { atualizarConfiguracoes } from '@/app/actions/configuracoes';

export interface Configuracao {
  taxaEstabelecimentoPercentual: string;
  taxaProfissionalPercentual: string;
  momentoCaptura: string;
  politicaLiberacao: string;
  escrowDiasRetencao: number;
  aceitaPix: boolean;
  aceitaCartao: boolean;
  aceitaBoleto: boolean;
  valorMinimoPlantao: string;
}

const MOMENTO_CAPTURA = [
  ['ACEITE_CANDIDATURA', 'Na aceitação da candidatura'],
  ['INICIO_PLANTAO', 'No início do plantão'],
  ['POS_CONCLUSAO', 'Após a conclusão'],
] as const;

const POLITICA_LIBERACAO = [
  ['MANUAL_NA_CONCLUSAO', 'Na conclusão do plantão'],
  ['AUTOMATICA_POR_PRAZO', 'Automática, só por prazo'],
  ['APOS_AVALIACAO_MUTUA', 'Após avaliação das duas partes'],
] as const;

/** Plantão de referência usado só para ilustrar a política. */
const PLANTAO_EXEMPLO = 120_000;

export function ConfiguracoesForm({ inicial }: { inicial: Configuracao }) {
  const [state, action, pending] = useActionState(atualizarConfiguracoes, undefined);

  const [taxaEstab, setTaxaEstab] = useState(inicial.taxaEstabelecimentoPercentual);
  const [taxaProf, setTaxaProf] = useState(inicial.taxaProfissionalPercentual);
  const [captura, setCaptura] = useState(inicial.momentoCaptura);
  const [boleto, setBoleto] = useState(inicial.aceitaBoleto);

  let previa: ReturnType<typeof calcularSplit> | null = null;
  try {
    previa = calcularSplit(PLANTAO_EXEMPLO, {
      taxaEstabelecimentoPercentual: Number(taxaEstab) || 0,
      taxaProfissionalPercentual: Number(taxaProf) || 0,
    });
  } catch {
    previa = null;
  }

  const boletoNoAceite = boleto && captura === 'ACEITE_CANDIDATURA';

  return (
    <form action={action} className="space-y-8">
      {/* ── Comissão ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Comissão da plataforma</h2>
        <p className="text-sm text-muted mt-1">
          A taxa do estabelecimento é somada ao valor do plantão; a do profissional é
          descontada do repasse.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="taxaEstabelecimentoPercentual" className="field-label">
              Taxa do estabelecimento (%)
            </label>
            <input
              id="taxaEstabelecimentoPercentual"
              name="taxaEstabelecimentoPercentual"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxaEstab}
              onChange={(e) => setTaxaEstab(e.target.value)}
              className="field-input"
            />
          </div>
          <div>
            <label htmlFor="taxaProfissionalPercentual" className="field-label">
              Taxa do profissional (%)
            </label>
            <input
              id="taxaProfissionalPercentual"
              name="taxaProfissionalPercentual"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxaProf}
              onChange={(e) => setTaxaProf(e.target.value)}
              className="field-input"
            />
          </div>
        </div>

        {/* Prévia do split */}
        <div className="mt-6 rounded-[var(--radius)] bg-primary-tint p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Prévia — plantão de {formatarBRL(PLANTAO_EXEMPLO)}
          </p>
          {previa ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Valor do plantão</dt>
                <dd className="text-ink tabular-nums">{formatarBRL(previa.valorPlantao)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Taxa do estabelecimento</dt>
                <dd className="text-ink tabular-nums">
                  + {formatarBRL(previa.taxaEstabelecimento)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-primary/20 pt-2">
                <dt className="font-semibold text-ink">Estabelecimento paga</dt>
                <dd className="font-semibold text-ink tabular-nums">
                  {formatarBRL(previa.totalCobrado)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Taxa do profissional</dt>
                <dd className="text-ink tabular-nums">
                  − {formatarBRL(previa.taxaProfissional)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-semibold text-ink">Profissional recebe</dt>
                <dd className="font-semibold text-ink tabular-nums">
                  {formatarBRL(previa.valorRepasse)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-primary/20 pt-2">
                <dt className="font-semibold text-primary">Receita VAPT</dt>
                <dd className="font-semibold text-primary tabular-nums">
                  {formatarBRL(previa.comissaoTotal)}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-2 text-sm text-danger">Percentuais inválidos.</p>
          )}
        </div>
      </section>

      {/* ── Escrow ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Retenção (escrow)</h2>
        <p className="text-sm text-muted mt-1">
          Quando o estabelecimento é cobrado e quando o valor retido é liberado ao
          profissional.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="momentoCaptura" className="field-label">
              Cobrar o estabelecimento
            </label>
            <select
              id="momentoCaptura"
              name="momentoCaptura"
              value={captura}
              onChange={(e) => setCaptura(e.target.value)}
              className="field-input"
            >
              {MOMENTO_CAPTURA.map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="politicaLiberacao" className="field-label">
              Liberar o valor retido
            </label>
            <select
              id="politicaLiberacao"
              name="politicaLiberacao"
              defaultValue={inicial.politicaLiberacao}
              className="field-input"
            >
              {POLITICA_LIBERACAO.map(([valor, label]) => (
                <option key={valor} value={valor}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="escrowDiasRetencao" className="field-label">
              Prazo máximo de retenção (dias)
            </label>
            <input
              id="escrowDiasRetencao"
              name="escrowDiasRetencao"
              type="number"
              min="0"
              max="180"
              defaultValue={inicial.escrowDiasRetencao}
              className="field-input"
            />
            <p className="mt-1.5 text-xs text-muted">
              Rede de segurança: o Asaas libera sozinho após esse prazo.
            </p>
          </div>
          <div>
            <label htmlFor="valorMinimoPlantao" className="field-label">
              Valor mínimo do plantão (R$)
            </label>
            <input
              id="valorMinimoPlantao"
              name="valorMinimoPlantao"
              type="number"
              min="0"
              step="0.01"
              defaultValue={inicial.valorMinimoPlantao}
              className="field-input"
            />
            <p className="mt-1.5 text-xs text-muted">
              Régua de preço mínimo. Use 0 para desativar.
            </p>
          </div>
        </div>
      </section>

      {/* ── Meios de pagamento ── */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Meios de pagamento</h2>
        <p className="text-sm text-muted mt-1">
          Formas aceitas do estabelecimento ao pagar um plantão.
        </p>

        <div className="mt-5 space-y-3">
          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="aceitaPix"
              defaultChecked={inicial.aceitaPix}
              className="size-4 accent-[var(--color-primary)]"
            />
            Pix
            <span className="text-muted">— confirma em segundos, sem chargeback</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="aceitaCartao"
              defaultChecked={inicial.aceitaCartao}
              className="size-4 accent-[var(--color-primary)]"
            />
            Cartão de crédito
            <span className="text-muted">— permite parcelar, sujeito a chargeback</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-ink">
            <input
              type="checkbox"
              name="aceitaBoleto"
              checked={boleto}
              onChange={(e) => setBoleto(e.target.checked)}
              className="size-4 accent-[var(--color-primary)]"
            />
            Boleto
            <span className="text-muted">— compensa em 1 a 3 dias úteis</span>
          </label>
        </div>

        {boletoNoAceite && (
          <p className="mt-4 rounded-[var(--radius)] bg-warning/10 border border-warning/30 p-3 text-sm text-ink">
            <strong className="text-warning">Atenção:</strong> boleto leva de 1 a 3 dias
            úteis para compensar. Com a cobrança na aceitação da candidatura, um plantão
            para as próximas horas pode começar sem o pagamento confirmado.
          </p>
        )}
      </section>

      {state?.error && <p className="text-danger text-sm">{state.error}</p>}
      {state?.success && (
        <p className="text-success text-sm">Configurações salvas.</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? 'Salvando…' : 'Salvar configurações'}
        </button>
        <Link href="/admin" className="btn btn-outline">
          Voltar
        </Link>
      </div>
    </form>
  );
}
