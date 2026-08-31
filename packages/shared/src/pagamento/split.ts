/**
 * Cálculo do split de pagamento de um plantão.
 *
 * Todos os valores trafegam em **centavos inteiros**. Dinheiro nunca é
 * representado em ponto flutuante: `0.1 + 0.2 !== 0.3` e um erro de
 * arredondamento aqui é um erro de repasse.
 */

export interface PoliticaPagamento {
  /** Comissão cobrada do estabelecimento, por cima do valor do plantão (%). */
  taxaEstabelecimentoPercentual: number;
  /** Comissão descontada do repasse ao profissional (%). */
  taxaProfissionalPercentual: number;
}

export interface SplitCalculado {
  /** Valor do plantão anunciado, antes de qualquer taxa. */
  valorPlantao: number;
  /** Comissão paga pelo estabelecimento (somada ao total). */
  taxaEstabelecimento: number;
  /** Comissão descontada do profissional (subtraída do repasse). */
  taxaProfissional: number;
  /** Total debitado do estabelecimento. */
  totalCobrado: number;
  /** Líquido que o profissional recebe via split. */
  valorRepasse: number;
  /** Receita da plataforma nesta transação. */
  comissaoTotal: number;
}

export class PoliticaPagamentoInvalidaError extends Error {}

function percentualDe(valorCentavos: number, percentual: number): number {
  // Multiplica antes de dividir para não perder precisão, e arredonda o
  // resultado final ao centavo.
  return Math.round((valorCentavos * percentual) / 100);
}

function validar(valorPlantao: number, politica: PoliticaPagamento): void {
  if (!Number.isInteger(valorPlantao) || valorPlantao <= 0) {
    throw new PoliticaPagamentoInvalidaError(
      'Valor do plantão deve ser um número inteiro de centavos maior que zero.',
    );
  }

  const taxas = [
    ['estabelecimento', politica.taxaEstabelecimentoPercentual] as const,
    ['profissional', politica.taxaProfissionalPercentual] as const,
  ];

  for (const [nome, percentual] of taxas) {
    if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) {
      throw new PoliticaPagamentoInvalidaError(
        `Taxa do ${nome} deve estar entre 0 e 100 por cento.`,
      );
    }
  }
}

/**
 * Calcula o split de um plantão sob a política informada.
 *
 * Invariante: `totalCobrado === valorRepasse + comissaoTotal` — nada é criado
 * nem perdido na divisão.
 */
export function calcularSplit(
  valorPlantaoCentavos: number,
  politica: PoliticaPagamento,
): SplitCalculado {
  validar(valorPlantaoCentavos, politica);

  const taxaEstabelecimento = percentualDe(
    valorPlantaoCentavos,
    politica.taxaEstabelecimentoPercentual,
  );
  const taxaProfissional = percentualDe(
    valorPlantaoCentavos,
    politica.taxaProfissionalPercentual,
  );

  return {
    valorPlantao: valorPlantaoCentavos,
    taxaEstabelecimento,
    taxaProfissional,
    totalCobrado: valorPlantaoCentavos + taxaEstabelecimento,
    valorRepasse: valorPlantaoCentavos - taxaProfissional,
    comissaoTotal: taxaEstabelecimento + taxaProfissional,
  };
}

/** Converte o `numeric` do Postgres (ex: "1200.00") para centavos inteiros. */
export function reaisParaCentavos(valor: string | number): number {
  const texto = typeof valor === 'number' ? valor.toFixed(2) : valor.trim();
  const match = /^-?\d+(\.\d{1,2})?$/.exec(texto);
  if (!match) {
    throw new PoliticaPagamentoInvalidaError(`Valor monetário inválido: ${valor}`);
  }
  const [inteira, decimal = ''] = texto.split('.');
  const centavos = decimal.padEnd(2, '0');
  const sinal = inteira.startsWith('-') ? -1 : 1;
  return sinal * (Math.abs(Number(inteira)) * 100 + Number(centavos));
}

/** Converte centavos inteiros para o formato `numeric` do Postgres. */
export function centavosParaReais(centavos: number): string {
  const sinal = centavos < 0 ? '-' : '';
  const absoluto = Math.abs(centavos);
  return `${sinal}${Math.floor(absoluto / 100)}.${String(absoluto % 100).padStart(2, '0')}`;
}

/** Formata centavos para exibição em BRL (ex: "R$ 1.200,00"). */
export function formatarBRL(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
