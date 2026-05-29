'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-8 px-6 border-t"
      style={{ borderColor: 'var(--b)' }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <a href="#" className="font-black text-lg tracking-tight">
          Ferudin<span style={{ color: 'var(--g)' }}>.</span>
        </a>

        <nav aria-label="Footer navigation">
          <ul className="flex items-center gap-6 list-none">
            {['#services', '#work', '#about', '#contact'].map(href => (
              <li key={href}>
                <a
                  href={href}
                  className="text-xs text-[var(--text-sub)] hover:text-white transition-colors duration-200 capitalize"
                >
                  {href.replace('#', '')}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p className="text-xs text-[var(--text-sub)]">
          © {year} {t('copy')}
        </p>
      </div>
    </footer>
  );
}
