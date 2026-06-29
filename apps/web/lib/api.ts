import 'server-only';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3333';

export async function apiRequest(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get('session')?.value;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // TEMP DIAGNOSTIC — never logs the token value, only presence/length.
  console.log(
    `[apiRequest] ${init.method ?? 'GET'} ${path} | token=${token ? `present(${token.length})` : 'MISSING'} | API_URL=${API_URL}`,
  );

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    console.log(`[apiRequest] ${init.method ?? 'GET'} ${path} -> ${res.status} ${res.statusText}`);
  }

  return res;
}
