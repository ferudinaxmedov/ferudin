import type { Metadata, Viewport } from 'next';
import { Onest, JetBrains_Mono } from 'next/font/google';
import './my.css';

const onest = Onest({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-onest', display: 'swap' });
const jb = JetBrains_Mono({ subsets: ['latin'], weight: ['500', '700'], variable: '--font-jb', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'My · Ferudin', template: '%s · My' },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#0A0C10', colorScheme: 'dark' };

export default function HubRoot({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${onest.variable} ${jb.variable}`}>
      <body className="hub">{children}</body>
    </html>
  );
}
