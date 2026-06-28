import 'server-only';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export interface SessionPayload {
  sub: string;
  email: string;
  role: string;
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
