'use client';

import { useTranslations } from 'next-intl';

const icons = {
  telegram: <path d="M21 4L3 11l6 2m12-9l-3 16-6-6m9-10L9 13m0 0v6l3-3" />,
  instagram: <g><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" /></g>,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />,
  email: <g><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" /></g>,
};

export default function Contact() {
  const t = useTranslations('contact');

  const items = [
    { key: 'telegram', label: t('telegram'), value: '@ferudin_ahmedov', href: 'https://t.me/ferudin_ahmedov', color: '#38bdf8' },
    { key: 'instagram', label: t('instagram'), value: '@ferudin.ibnsamad', href: 'https://instagram.com/ferudin.ibnsamad', color: '#f472b6' },
    { key: 'phone', label: t('phone'), value: '+998 93 245 06 25', href: 'tel:+998932450625', color: '#6ee7b7' },
    { key: 'email', label: t('email'), value: 'ferudinaxmedov@gmail.com', href: 'mailto:ferudinaxmedov@gmail.com', color: '#c4b5fd' },
  ] as const;

  return (
    <section id="contact" className="relative py-24 md:py-32 px-5 scroll-mt-10">
      <div className="max-w-5xl mx-auto">
        <div className="reveal glass glass-strong relative overflow-hidden rounded-[36px] p-7 sm:p-12">
          <div aria-hidden className="pointer-events-none absolute -top-24 -right-16 w-[380px] h-[380px] rounded-full blur-3xl opacity-50" style={{ background: 'radial-gradient(circle, #6ee7b7, transparent 65%)' }} />
          <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 w-[380px] h-[380px] rounded-full blur-3xl opacity-40" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 65%)' }} />

          <div className="relative z-[1] max-w-2xl mb-10">
            <p className="eyebrow mb-3">{t('label')}</p>
            <h2 className="font-extrabold tracking-tight leading-[1.05] mb-4" style={{ fontSize: 'clamp(2.1rem, 5vw, 3.4rem)' }}>
              {t('heading')}
            </h2>
            <p className="text-[var(--ink-2)] text-lg">{t('sub')}</p>
          </div>

          <div className="relative z-[1] grid sm:grid-cols-2 gap-3 mb-8">
            {items.map(c => (
              <a
                key={c.key}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="glass spot sheen flex items-center gap-4 rounded-2xl p-4 min-h-[72px] transition-transform duration-300 hover:-translate-y-0.5"
                style={{ ['--spot' as string]: `${c.color}30`, ['--spot-strong' as string]: c.color }}
              >
                <span className="relative z-[1] w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border border-white/15" style={{ background: `${c.color}22`, color: c.color }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {icons[c.key]}
                  </svg>
                </span>
                <span className="relative z-[1] min-w-0">
                  <span className="block text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--ink-3)]">{c.label}</span>
                  <span className="block text-[15px] font-semibold truncate">{c.value}</span>
                </span>
              </a>
            ))}
          </div>

          <a href="https://t.me/ferudin_ahmedov" target="_blank" rel="noopener noreferrer" className="relative z-[1] btn btn-primary w-full sm:w-auto">
            {t('cta')}
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M2 7h10M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
