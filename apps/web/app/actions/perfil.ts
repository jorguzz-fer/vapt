'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

export async function atualizarPerfilProfissional(_: unknown, formData: FormData) {
  const especialidade = formData.get('especialidade') as string | null;
  const bio = formData.get('bio') as string | null;

  const res = await apiRequest('/perfil/profissional', {
    method: 'PATCH',
    body: JSON.stringify({
      ...(especialidade ? { especialidade } : {}),
      ...(bio ? { bio } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao atualizar perfil.' };
  }

  revalidatePath('/profissional/perfil');
  revalidatePath('/profissional');
}

export async function atualizarPerfilEstabelecimento(_: unknown, formData: FormData) {
  const nomeFantasia = formData.get('nomeFantasia') as string | null;
  const telefone = formData.get('telefone') as string | null;
  const endereco = formData.get('endereco') as string | null;

  const res = await apiRequest('/perfil/estabelecimento', {
    method: 'PATCH',
    body: JSON.stringify({
      ...(nomeFantasia ? { nomeFantasia } : {}),
      ...(telefone ? { telefone } : {}),
      ...(endereco ? { endereco } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Erro ao atualizar perfil.' };
  }

  revalidatePath('/estabelecimento/perfil');
  revalidatePath('/estabelecimento');
}
