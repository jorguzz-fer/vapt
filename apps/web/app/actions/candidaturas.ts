'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

export async function candidatar(_: unknown, formData: FormData) {
  const plantaoId = formData.get('plantaoId') as string;
  const mensagem = formData.get('mensagem') as string;

  const res = await apiRequest('/candidaturas', {
    method: 'POST',
    body: JSON.stringify({
      plantaoId,
      ...(mensagem ? { mensagem } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao enviar candidatura.' };
  }

  revalidatePath('/profissional');
}
