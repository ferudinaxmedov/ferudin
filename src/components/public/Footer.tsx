'use client';

import { useTranslations } from 'next-intl';

const sites = [
  ['DentaFlow', 'https://dentaflow.uz'],
  ['Seedbee', 'https://seedbee.uz'],
  ['SkyPlus', 'https://skyplus.uz'],
  ['Men kimman?', 'https://men-kimman.uz'],
];

export default function Footer() {
  const t = useTranslations('footer');
  const n = useTranslations('nav');
  const year = new Date().getFullYear();

  return (
    <footer className="relative px-5 pb-8 pt-4">
      <div className="max-w-6xl mx-auto glass rounded-[28px] px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-5">
        <a href="#" className="font-extrabold text-lg tracking-tight">
          Ferudin<span className="text-[var(--a1)]">.</span>
        </a>

        <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {sites.map(([name, href]) => (
            <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-[var(--ink-2)] hover:text-white transition-colors">
              {name}
            </a>
          ))}
          <a href="#contact" className="text-[13px] font-semibold text-[var(--ink-2)] hover:text-white transition-colors">
            {n('contact')}
          </a>
        </nav>

        <p className="text-xs text-[var(--ink-3)]">
          © {year} {t('copy')}
        </p>
      </div>
    </footer>
  );
}
