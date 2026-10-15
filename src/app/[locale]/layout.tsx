import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Manrope } from 'next/font/google';
import { routing } from '@/i18n/routing';
import '../globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ferudin — Web Designer & Developer',
  description: 'Web designer & developer from Tashkent. DentaFlow, Seedbee, SkyPlus and more: websites, CRM systems and UI/UX.',
  metadataBase: new URL('https://ferudin.uz'),
  openGraph: {
    title: 'Ferudin — Web Designer & Developer',
    description: 'Boutique web design & development studio.',
    url: 'https://ferudin.uz',
    siteName: 'Ferudin',
    locale: 'uz_UZ',
    type: 'website',
  },
};

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
    <html lang={locale} className={`dark ${manrope.variable}`}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
