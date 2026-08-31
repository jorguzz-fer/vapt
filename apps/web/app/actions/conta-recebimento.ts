'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/lib/api';

/** Mantém só dígitos — o Asaas recusa CPF/CEP/telefone com máscara. */
function digitos(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? '').replace(/\D/g, '');
}

export async function criarContaRecebimento(_: unknown, formData: FormData) {
  const payload = {
    cpfCnpj: digitos(formData, 'cpfCnpj'),
    mobilePhone: digitos(formData, 'mobilePhone'),
    incomeValue: Number(formData.get('incomeValue')),
    postalCode: digitos(formData, 'postalCode'),
    address: String(formData.get('address') ?? '').trim(),
    addressNumber: String(formData.get('addressNumber') ?? '').trim(),
    province: String(formData.get('province') ?? '').trim(),
  };

  const res = await apiRequest('/conta-recebimento', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    return { error: msg || 'Não foi possível criar a conta de recebimento.' };
  }

  revalidatePath('/profissional/perfil');
  return { success: true };
}
