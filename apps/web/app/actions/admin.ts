'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

export async function verificarProfissional(_: unknown, formData: FormData) {
  const profissionalId = formData.get('profissionalId') as string;

  const res = await apiRequest(`/admin/profissionais/${profissionalId}/verificar`, {
    method: 'PATCH',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao verificar profissional.' };
  }

  revalidatePath('/admin');
}
