'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

export async function criarPlantao(_: unknown, formData: FormData) {
  const cep = (formData.get('cep') as string).replace(/\D/g, '');
  const volumeRaw = formData.get('volumePacientes') as string;
  const observacoes = formData.get('observacoes') as string;

  const data = {
    tipo: formData.get('tipo'),
    tipoPorta: formData.get('tipoPorta'),
    duracao: formData.get('duracao'),
    especialidade: formData.get('especialidade'),
    valorProposto: Number(formData.get('valorProposto')),
    ...(volumeRaw ? { volumePacientes: Number(volumeRaw) } : {}),
    cep,
    localizacao: formData.get('localizacao'),
    ...(observacoes ? { observacoes } : {}),
    dataInicio: formData.get('dataInicio'),
    dataFim: formData.get('dataFim'),
  };

  const res = await apiRequest('/plantoes', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao criar plantão.' };
  }

  redirect('/estabelecimento');
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
