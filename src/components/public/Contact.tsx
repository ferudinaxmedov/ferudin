'use client';

import { useTranslations } from 'next-intl';

const channels = [
  {
    key: 'telegram',
    label: 'Telegram',
    handle: '@ferudin_ahmedov',
    href: 'https://t.me/ferudin_ahmedov',
    color: '#229ED9',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z" />
      </svg>
    ),
  },
  {
    key: 'instagram',
    label: 'Instagram',
    handle: '@ferudin.ibnsamad',
    href: 'https://instagram.com/ferudin.ibnsamad',
    color: '#E1306C',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'phone',
    label: 'Telefon',
    handle: '+998 93 245 06 25',
    href: 'tel:+998932450625',
    color: '#22c55e',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.1 1.17 2 2 0 012.11 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'email',
    label: 'Email',
    handle: 'ferudinaxmedov@gmail.com',
    href: 'mailto:ferudinaxmedov@gmail.com',
    color: '#f59e0b',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function Contact() {
  const t = useTranslations('contact');

  return (
    <section id="contact" className="py-28 px-6 relative overflow-hidden">
      {/* Top line */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }}
        aria-hidden
      />
      {/* Bottom glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] animate-glow"
        style={{ background: 'radial-gradient(ellipse, rgba(34,197,94,0.09) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="reveal text-[var(--g)] text-xs font-semibold tracking-[0.14em] uppercase mb-4">
            {t('label')}
          </p>
          <h2
            className="reveal d1 font-black text-white leading-tight mb-4"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            {t('heading')}
          </h2>
          <p className="reveal d2 text-[var(--text-sub)] text-base">{t('sub')}</p>
        </div>

        {/* Channel grid */}
        <div className="reveal d2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {channels.map(c => (
            <a
              key={c.key}
              href={c.href}
              target={c.key !== 'email' && c.key !== 'phone' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:border-opacity-50"
              style={{ borderColor: 'var(--b)', background: 'var(--surface)' }}
              aria-label={`${c.label}: ${c.handle}`}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at top, ${c.color}12 0%, transparent 70%)` }}
                aria-hidden
              />
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-350 origin-left"
                style={{ background: c.color }}
                aria-hidden
              />

              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
                style={{
                  borderColor: `${c.color}30`,
                  background: `${c.color}10`,
                  color: c.color,
                }}
              >
                {c.icon}
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-sm">{c.label}</p>
                <p className="text-[var(--text-sub)] text-xs mt-0.5 break-all">{c.handle}</p>
              </div>
            </a>
          ))}
        </div>

        {/* CTA button */}
        <div className="reveal d3 flex justify-center">
          <a
            href="https://t.me/ferudin_ahmedov"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-4 bg-[var(--g)] text-black font-bold text-base rounded-full hover:bg-[#4ade80] transition-all duration-200 hover:shadow-[0_0_36px_rgba(34,197,94,0.45)] hover:-translate-y-0.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.94z" />
            </svg>
            {t('cta')}
          </a>
        </div>
      </div>
    </section>
  );
}
