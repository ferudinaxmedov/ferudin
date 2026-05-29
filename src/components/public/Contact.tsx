'use client';

import { useTranslations } from 'next-intl';

export default function Contact() {
  const t = useTranslations('contact');

  const channels = [
    {
      key: 'telegram',
      label: 'Telegram',
      handle: '@ferudin',
      href: 'https://t.me/ferudin',
      color: '#229ED9',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z" />
        </svg>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      handle: '@ferudin',
      href: 'https://instagram.com/ferudin',
      color: '#E1306C',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      handle: 'hello@ferudin.uz',
      href: 'mailto:hello@ferudin.uz',
      color: '#22c55e',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
  ];

  return (
    <section id="contact" className="py-28 px-6 relative overflow-hidden">
      {/* Top line */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }}
        aria-hidden
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] animate-glow"
        style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          <p className="reveal text-[var(--g)] text-xs font-semibold tracking-[0.14em] uppercase mb-4">
            {t('label')}
          </p>
          <h2
            className="reveal d1 font-black text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            {t('heading')}
          </h2>
          <p className="reveal d2 text-[var(--text-sub)] text-base mb-12">
            {t('sub')}
          </p>

          {/* Channel cards */}
          <div className="reveal d2 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {channels.map(c => (
              <a
                key={c.key}
                href={c.href}
                target={c.key !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: 'var(--b)',
                  background: 'var(--surface)',
                }}
                aria-label={`${c.label}: ${c.handle}`}
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(circle at top, ${c.color}10 0%, transparent 70%)` }}
                  aria-hidden
                />
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                  style={{
                    borderColor: `${c.color}30`,
                    background: `${c.color}12`,
                    color: c.color,
                  }}
                >
                  {c.icon}
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{c.label}</p>
                  <p className="text-[var(--text-sub)] text-xs mt-0.5">{c.handle}</p>
                </div>
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ background: c.color }}
                  aria-hidden
                />
              </a>
            ))}
          </div>

          {/* Big CTA */}
          <div className="reveal d3 flex flex-wrap justify-center gap-4">
            <a
              href="https://t.me/ferudin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-[var(--g)] text-black font-bold rounded-full hover:bg-[#4ade80] transition-all duration-200 hover:shadow-[0_0_32px_rgba(34,197,94,0.4)] hover:-translate-y-0.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z" />
              </svg>
              Telegram orqali yozing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
