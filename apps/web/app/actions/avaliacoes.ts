'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

export async function avaliar(_: unknown, formData: FormData) {
  const plantaoId = formData.get('plantaoId') as string;
  const nota = Number(formData.get('nota'));
  const comentario = formData.get('comentario') as string;

  if (!nota || nota < 1 || nota > 5) {
    return { error: 'Nota inválida. Escolha de 1 a 5.' };
  }

  const res = await apiRequest('/avaliacoes', {
    method: 'POST',
    body: JSON.stringify({
      plantaoId,
      nota,
      ...(comentario ? { comentario } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao enviar avaliação.' };
  }

  revalidatePath(`/estabelecimento/plantoes/${plantaoId}`);
  revalidatePath('/profissional');
}

export async function concluirPlantao(_: unknown, formData: FormData) {
  const plantaoId = formData.get('plantaoId') as string;

  const res = await apiRequest(`/plantoes/${plantaoId}/concluir`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao concluir plantão.' };
  }

  revalidatePath(`/estabelecimento/plantoes/${plantaoId}`);
  revalidatePath('/estabelecimento');
}
