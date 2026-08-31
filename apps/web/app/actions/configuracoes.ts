'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

function numero(formData: FormData, campo: string) {
  const bruto = formData.get(campo);
  if (bruto === null || bruto === '') return undefined;
  return Number(bruto);
}

export async function atualizarConfiguracoes(_: unknown, formData: FormData) {
  const payload = {
    taxaEstabelecimentoPercentual: numero(formData, 'taxaEstabelecimentoPercentual'),
    taxaProfissionalPercentual: numero(formData, 'taxaProfissionalPercentual'),
    momentoCaptura: formData.get('momentoCaptura') as string,
    politicaLiberacao: formData.get('politicaLiberacao') as string,
    escrowDiasRetencao: numero(formData, 'escrowDiasRetencao'),
    aceitaPix: formData.get('aceitaPix') === 'on',
    aceitaCartao: formData.get('aceitaCartao') === 'on',
    aceitaBoleto: formData.get('aceitaBoleto') === 'on',
    valorMinimoPlantao: numero(formData, 'valorMinimoPlantao'),
  };

  const res = await apiRequest('/configuracoes', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao salvar configurações.' };
  }

  revalidatePath('/admin/configuracoes');
  return { success: true };
}
