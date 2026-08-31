import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calcularSplit,
  centavosParaReais,
  formatarBRL,
  PoliticaPagamentoInvalidaError,
  reaisParaCentavos,
} from './split.ts';

/** R$ 1.200,00 — valor típico de um plantão. */
const PLANTAO = 120_000;

describe('calcularSplit', () => {
  it('cobra a comissão do estabelecimento por cima do valor do plantão', () => {
    const split = calcularSplit(PLANTAO, {
      taxaEstabelecimentoPercentual: 10,
      taxaProfissionalPercentual: 0,
    });

    assert.equal(split.totalCobrado, 132_000); // R$ 1.320,00
    assert.equal(split.valorRepasse, 120_000); // profissional recebe cheio
    assert.equal(split.comissaoTotal, 12_000);
  });

  it('desconta a comissão do repasse ao profissional', () => {
    const split = calcularSplit(PLANTAO, {
      taxaEstabelecimentoPercentual: 0,
      taxaProfissionalPercentual: 10,
    });

    assert.equal(split.totalCobrado, 120_000); // estabelecimento paga o anunciado
    assert.equal(split.valorRepasse, 108_000); // R$ 1.080,00
    assert.equal(split.comissaoTotal, 12_000);
  });

  it('divide a comissão entre as duas partes', () => {
    const split = calcularSplit(PLANTAO, {
      taxaEstabelecimentoPercentual: 5,
      taxaProfissionalPercentual: 5,
    });

    assert.equal(split.totalCobrado, 126_000);
    assert.equal(split.valorRepasse, 114_000);
    assert.equal(split.comissaoTotal, 12_000);
  });

  it('não cobra nada quando as taxas são zero', () => {
    const split = calcularSplit(PLANTAO, {
      taxaEstabelecimentoPercentual: 0,
      taxaProfissionalPercentual: 0,
    });

    assert.equal(split.totalCobrado, PLANTAO);
    assert.equal(split.valorRepasse, PLANTAO);
    assert.equal(split.comissaoTotal, 0);
  });

  it('arredonda ao centavo quando o percentual gera fração', () => {
    // 1% de R$ 100,55 = R$ 1,0055 → arredonda para R$ 1,01
    const split = calcularSplit(10_055, {
      taxaEstabelecimentoPercentual: 1,
      taxaProfissionalPercentual: 0,
    });

    assert.equal(split.taxaEstabelecimento, 101);
    assert.equal(split.totalCobrado, 10_156);
  });

  it('aceita percentual fracionado', () => {
    const split = calcularSplit(PLANTAO, {
      taxaEstabelecimentoPercentual: 7.5,
      taxaProfissionalPercentual: 0,
    });

    assert.equal(split.taxaEstabelecimento, 9_000); // R$ 90,00
  });

  it('preserva a invariante: total cobrado = repasse + comissão', () => {
    const valores = [1, 99, 100, 333, 10_055, 120_000, 987_654];
    const percentuais = [0, 0.5, 1, 7.5, 10, 33.33, 100];

    for (const valor of valores) {
      for (const estab of percentuais) {
        for (const prof of percentuais) {
          const split = calcularSplit(valor, {
            taxaEstabelecimentoPercentual: estab,
            taxaProfissionalPercentual: prof,
          });

          assert.equal(
            split.totalCobrado,
            split.valorRepasse + split.comissaoTotal,
            `quebrou em valor=${valor} estab=${estab}% prof=${prof}%`,
          );
        }
      }
    }
  });

  it('nunca deixa o repasse negativo, mesmo com taxa de 100%', () => {
    const split = calcularSplit(PLANTAO, {
      taxaEstabelecimentoPercentual: 0,
      taxaProfissionalPercentual: 100,
    });

    assert.equal(split.valorRepasse, 0);
  });

  describe('validação', () => {
    const politicaOk = {
      taxaEstabelecimentoPercentual: 10,
      taxaProfissionalPercentual: 0,
    };

    it('rejeita valor zero ou negativo', () => {
      assert.throws(
        () => calcularSplit(0, politicaOk),
        PoliticaPagamentoInvalidaError,
      );
      assert.throws(
        () => calcularSplit(-100, politicaOk),
        PoliticaPagamentoInvalidaError,
      );
    });

    it('rejeita valor fracionado (centavos devem ser inteiros)', () => {
      assert.throws(
        () => calcularSplit(100.5, politicaOk),
        PoliticaPagamentoInvalidaError,
      );
    });

    it('rejeita percentual fora de 0–100', () => {
      assert.throws(
        () =>
          calcularSplit(PLANTAO, {
            taxaEstabelecimentoPercentual: 101,
            taxaProfissionalPercentual: 0,
          }),
        PoliticaPagamentoInvalidaError,
      );
      assert.throws(
        () =>
          calcularSplit(PLANTAO, {
            taxaEstabelecimentoPercentual: 0,
            taxaProfissionalPercentual: -1,
          }),
        PoliticaPagamentoInvalidaError,
      );
    });
  });
});

describe('conversão monetária', () => {
  it('converte numeric do Postgres para centavos', () => {
    assert.equal(reaisParaCentavos('1200.00'), 120_000);
    assert.equal(reaisParaCentavos('0.01'), 1);
    assert.equal(reaisParaCentavos('99.9'), 9_990);
    assert.equal(reaisParaCentavos('100'), 10_000);
  });

  it('converte centavos para numeric do Postgres', () => {
    assert.equal(centavosParaReais(120_000), '1200.00');
    assert.equal(centavosParaReais(1), '0.01');
    assert.equal(centavosParaReais(0), '0.00');
  });

  it('faz round-trip sem perder centavos', () => {
    for (const centavos of [1, 99, 100, 10_055, 120_000, 987_654]) {
      assert.equal(reaisParaCentavos(centavosParaReais(centavos)), centavos);
    }
  });

  it('rejeita valor monetário malformado', () => {
    assert.throws(
      () => reaisParaCentavos('1.234'),
      PoliticaPagamentoInvalidaError,
    );
    assert.throws(() => reaisParaCentavos('abc'), PoliticaPagamentoInvalidaError);
  });

  it('formata em BRL', () => {
    // Espaço não-quebrável entre símbolo e número no locale pt-BR.
    assert.match(formatarBRL(120_000), /R\$\s?1\.200,00/);
  });
});
