import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowUpRight, BookOpen, Globe, Megaphone, Phone, Send, Tag } from 'lucide-react';
import { getC, tgLink, TG } from '@/content/site';
import LangSwitch from '@/components/site/LangSwitch';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const c = getC((await params).locale);
  return { title: { absolute: c.link.title }, description: c.link.tagline };
}

const SITE = 'https://ferudin.uz';

export default async function LinkPage({ params }: { params: Params }) {
  const { locale } = await params;
  const c = getC(locale);
  const base = locale === 'uz' ? SITE : `${SITE}/${locale}`;

  // Tartib: avval sayt, keyin yozish, qo'ng'iroq, hamjamiyat, narxlar
  const targets: Record<string, { href: string; icon: React.ReactNode; main?: boolean }> = {
    site: { href: base, icon: <Globe aria-hidden />, main: true },
    tg: { href: tgLink(c.link.hello), icon: <Send aria-hidden /> },
    tel: { href: 'tel:+998932450625', icon: <Phone aria-hidden /> },
    ch: { href: 'https://t.me/FERUDIN_AIBLOK', icon: <Megaphone aria-hidden /> },
    cm: { href: 'https://community.ferudin.uz', icon: <BookOpen aria-hidden /> },
    prices: { href: `${base}/xizmatlar`, icon: <Tag aria-hidden /> },
  };

  return (
    <main className="lk">
      <div className="hero-bg" aria-hidden />
      <div className="lk-in">
        <div className="lk-top">
          <LangSwitch locale={locale} label={c.ui.lang} />
        </div>
        <div className="lk-ph">
          <Image src="/ferudin-portrait.webp" alt="Ferudin Ahmedov" fill unoptimized priority />
        </div>
        <h1 className="lk-name">Ferudin Ahmedov</h1>
        <p className="lk-tag">{c.link.tagline}</p>
        <span className="lk-badge"><i aria-hidden />{c.link.badge}</span>

        <nav className="lk-list" aria-label={c.link.title}>
          {c.link.items.map((it, i) => {
            const t = targets[it.key];
            if (!t) return null;
            const ext = !t.href.startsWith('tel:');
            return (
              <a
                key={it.key}
                href={t.href}
                target={ext ? '_blank' : undefined}
                rel={ext ? 'noopener noreferrer' : undefined}
                className={`lk-a ${t.main ? 'main' : ''}`}
                style={{ animationDelay: `${150 + i * 70}ms` }}
              >
                <span className="ic">{t.icon}</span>
                <span>
                  <b>{it.t}</b>
                  <span className="d">{it.d}</span>
                </span>
                <ArrowUpRight aria-hidden />
              </a>
            );
          })}
        </nav>

        <p className="lk-foot">
          <a href={TG} target="_blank" rel="noopener noreferrer">@ferudin_ahmedov</a> · <a href="https://instagram.com/ferudinahmedov" target="_blank" rel="noopener noreferrer">@ferudinahmedov</a>
        </p>
      </div>
    </main>
  );
}
