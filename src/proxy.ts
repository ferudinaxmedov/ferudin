import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const proto = request.headers.get('x-forwarded-proto') ?? '';
  const host = request.headers.get('host') ?? 'ferudin.uz';

  // Redirect HTTP → HTTPS (handles "http", "http, https" edge cases)
  if (proto.split(',')[0].trim() === 'http') {
    const httpsUrl = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, { status: 308 });
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
