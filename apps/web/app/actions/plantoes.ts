'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

export async function criarPlantao(_: unknown, formData: FormData) {
  // Raw values the user typed — echoed back on error so the form repopulates.
  const values = {
    tipo: (formData.get('tipo') as string) ?? '',
    tipoPorta: (formData.get('tipoPorta') as string) ?? '',
    duracao: (formData.get('duracao') as string) ?? '',
    especialidade: (formData.get('especialidade') as string) ?? '',
    valorProposto: (formData.get('valorProposto') as string) ?? '',
    volumePacientes: (formData.get('volumePacientes') as string) ?? '',
    cep: (formData.get('cep') as string) ?? '',
    localizacao: (formData.get('localizacao') as string) ?? '',
    observacoes: (formData.get('observacoes') as string) ?? '',
    dataInicio: (formData.get('dataInicio') as string) ?? '',
    dataFim: (formData.get('dataFim') as string) ?? '',
  };

  const data = {
    tipo: values.tipo,
    tipoPorta: values.tipoPorta,
    duracao: values.duracao,
    especialidade: values.especialidade,
    valorProposto: Number(values.valorProposto),
    ...(values.volumePacientes ? { volumePacientes: Number(values.volumePacientes) } : {}),
    cep: values.cep.replace(/\D/g, ''),
    localizacao: values.localizacao,
    ...(values.observacoes ? { observacoes: values.observacoes } : {}),
    dataInicio: values.dataInicio,
    dataFim: values.dataFim,
  };

  const res = await apiRequest('/plantoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao criar plantão.', values };
  }

  redirect('/estabelecimento');
}

export async function marcarNoShow(_: unknown, formData: FormData) {
  const plantaoId = formData.get('plantaoId') as string;

  const res = await apiRequest(`/plantoes/${plantaoId}/no-show`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao registrar no-show.' };
  }

  revalidatePath(`/estabelecimento/plantoes/${plantaoId}`);
  revalidatePath('/estabelecimento');
}

export async function cancelarPlantao(_: unknown, formData: FormData) {
  const plantaoId = formData.get('plantaoId') as string;
  const motivo = formData.get('motivo') as string | null;

  const res = await apiRequest(`/plantoes/${plantaoId}/cancelar`, {
    method: 'PATCH',
    body: JSON.stringify({ motivo: motivo || undefined }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao cancelar plantão.' };
  }

  revalidatePath(`/estabelecimento/plantoes/${plantaoId}`);
  revalidatePath('/estabelecimento');
}
