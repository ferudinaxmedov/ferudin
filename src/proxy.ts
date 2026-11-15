import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const proto = request.headers.get('x-forwarded-proto') ?? '';
  const host = request.headers.get('host') ?? 'ferudin.uz';

  // Redirect HTTP → HTTPS
  if (process.env.NODE_ENV === 'production' && proto.split(',')[0].trim() === 'http') {
    const httpsUrl = `https://${host}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(httpsUrl, { status: 308 });
  }

  // link.ferudin.uz: Instagram profili uchun havolalar sahifasi
  if (host.startsWith('link.')) {
    const seg = pathname.split('/')[1] ?? '';
    const isLocale = routing.locales.includes(seg as 'uz' | 'ru' | 'en');
    if (pathname === '/' || (isLocale && pathname === `/${seg}`)) {
      const cookie = request.cookies.get('NEXT_LOCALE')?.value;
      const accept = (request.headers.get('accept-language') ?? '').slice(0, 2).toLowerCase();
      const guess = routing.locales.includes(cookie as 'uz' | 'ru' | 'en')
        ? cookie
        : routing.locales.includes(accept as 'uz' | 'ru' | 'en') ? accept : 'uz';
      const locale = isLocale ? seg : guess;
      return NextResponse.rewrite(new URL(`/${locale}/link`, request.url));
    }
    // Boshqa har qanday yo'l asosiy saytga
    return NextResponse.redirect(`https://ferudin.uz${pathname}${request.nextUrl.search}`);
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
