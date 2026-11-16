import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { SESSION_COOKIE, verifyToken } from './lib/hub/session';

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

  // my.ferudin.uz: owner's hub. Password + TOTP session (src/lib/hub/session.ts) guards /my.
  // The old /workspace was removed (2026-11-17): any old link lands on the hub.
  const prod = process.env.NODE_ENV === 'production';
  const isHubHost = host.startsWith('my.');
  if (pathname === '/workspace' || pathname.startsWith('/workspace/')) {
    return NextResponse.redirect(prod ? 'https://my.ferudin.uz/my' : new URL('/my', request.url));
  }
  const isHubPath = pathname === '/my' || pathname.startsWith('/my/');

  if (isHubHost && !isHubPath) return NextResponse.redirect(new URL('/my', request.url));
  if (isHubPath) {
    // In production the hub lives only on its own subdomain (cookies are host-only).
    if (prod && !isHubHost) {
      return new NextResponse('Not found', { status: 404 });
    }
    if (pathname === '/my/login') return NextResponse.next();
    if (!verifyToken(request.cookies.get(SESSION_COOKIE)?.value, 'session')) {
      const url = new URL('/my/login', request.url);
      url.search = '';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('Cache-Control', 'no-store');
    return res;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
