'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const API_URL = process.env.API_URL ?? 'http://localhost:3333';

async function setSessionCookie(accessToken: string) {
  (await cookies()).set('session', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

export async function login(_: unknown, formData: FormData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) return { error: 'Email ou senha inválidos.' };

  const { accessToken } = await res.json();
  await setSessionCookie(accessToken);
  redirect('/dashboard');
}

export async function logout() {
  (await cookies()).delete('session');
  redirect('/login');
}

export async function registerProfissional(_: unknown, formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    nomeCompleto: formData.get('nomeCompleto') as string,
    crmv: formData.get('crmv') as string,
  };

  const res = await fetch(`${API_URL}/auth/register/profissional`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    // Echo back non-sensitive fields so the form repopulates (never the password).
    const { email, nomeCompleto, crmv } = data;
    return { error: msg || 'Erro ao criar conta.', values: { email, nomeCompleto, crmv } };
  }

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: data.email, password: data.password }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!loginRes.ok) redirect('/login');

  const { accessToken } = await loginRes.json();
  await setSessionCookie(accessToken);
  redirect('/profissional');
}

export async function registerEstabelecimento(_: unknown, formData: FormData) {
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    razaoSocial: formData.get('razaoSocial') as string,
    cnpj: formData.get('cnpj') as string,
    cep: formData.get('cep') as string,
    endereco: formData.get('endereco') as string,
  };

  const res = await fetch(`${API_URL}/auth/register/estabelecimento`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    // Echo back non-sensitive fields so the form repopulates (never the password).
    const { email, razaoSocial, cnpj, cep, endereco } = data;
    return {
      error: msg || 'Erro ao criar conta.',
      values: { email, razaoSocial, cnpj, cep, endereco },
    };
  }

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: data.email, password: data.password }),
    headers: { 'Content-Type': 'application/json' },
  });

  if (!loginRes.ok) redirect('/login');

  const { accessToken } = await loginRes.json();
  await setSessionCookie(accessToken);
  redirect('/estabelecimento');
}
