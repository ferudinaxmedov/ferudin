import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const proto = request.headers.get('x-forwarded-proto') ?? '';
  const host = request.headers.get('host') ?? 'ferudin.uz';

  // Redirect HTTP → HTTPS
  if (proto.split(',')[0].trim() === 'http') {
    const httpsUrl = `https://${host}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, { status: 308 });
  }

  // Workspace auth
  if (pathname.startsWith('/workspace')) {
    if (pathname === '/workspace/login') return NextResponse.next();

    const session = request.cookies.get('ws_session')?.value;
    if (session !== process.env.WORKSPACE_SESSION_TOKEN) {
      const url = new URL('/workspace/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
