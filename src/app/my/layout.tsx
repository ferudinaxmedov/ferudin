import type { Metadata, Viewport } from 'next';
import { onest, jb } from '@/lib/fonts';
import './my.css';

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
