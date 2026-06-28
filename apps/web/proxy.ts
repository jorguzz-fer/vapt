import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const PUBLIC_PATHS = ['/', '/login', '/cadastro'];
const ROLE_PATHS: Record<string, string> = {
  '/profissional': 'PROFISSIONAL',
  '/estabelecimento': 'ESTABELECIMENTO',
  '/admin': 'ADMIN',
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  const token = request.cookies.get('session')?.value;
  type Payload = { sub: string; email: string; role: string };
  let payload: Payload | null = null;

  if (token) {
    try {
      const { payload: p } = await jwtVerify(token, secret);
      payload = p as unknown as Payload;
    } catch {
      // expired or invalid — treat as logged out
    }
  }

  if (!isPublic && !payload) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (payload) {
    for (const [path, role] of Object.entries(ROLE_PATHS)) {
      if (pathname.startsWith(path) && payload.role !== role && payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
