import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Onest, JetBrains_Mono } from 'next/font/google';
import { routing } from '@/i18n/routing';
import { getC } from '@/content/site';
import '../site.css';

const onest = Onest({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
});

const jb = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '700'],
  variable: '--font-jb',
  display: 'swap',
});

const OG_LOCALE: Record<string, string> = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const c = getC(locale);
  const path = locale === 'uz' ? '/' : `/${locale}`;
  return {
    title: { default: c.meta.title, template: '%s · Ferudin' },
    description: c.meta.desc,
    metadataBase: new URL('https://ferudin.uz'),
    openGraph: {
      title: c.meta.title,
      description: c.meta.desc,
      url: `https://ferudin.uz${path === '/' ? '' : path}`,
      siteName: 'Ferudin',
      locale: OG_LOCALE[locale] ?? 'uz_UZ',
      type: 'website',
      images: ['/ferudin-portrait.webp'],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'uz' | 'ru' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${onest.variable} ${jb.variable}`}>
      <body className="site">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
