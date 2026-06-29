import 'server-only';
import { cookies } from 'next/headers';

const API_URL = process.env.API_URL ?? 'http://localhost:3333';

export async function apiRequest(path: string, init: RequestInit = {}) {
  const token = (await cookies()).get('session')?.value;
  const headers: HeadersInit = {
    // Only declare JSON when there's actually a body — Fastify rejects an
    // empty body when content-type is application/json (e.g. bodyless PATCHs).
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${API_URL}${path}`, { ...init, headers });
}
