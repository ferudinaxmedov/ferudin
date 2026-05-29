'use client';

import { useTranslations } from 'next-intl';

const services = [
  {
    key: 's1',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="4" y="6" width="32" height="22" rx="2.5" />
        <path d="M13 34h14M20 28v6" strokeLinecap="round" />
        <circle cx="11" cy="12" r="2" />
        <path d="M16 17l3.5-3.5 5 5 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 's2',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="4" y="8" width="32" height="26" rx="2.5" />
        <path d="M4 16h32" />
        <path d="M13 24h14M13 29h9" strokeLinecap="round" />
        <circle cx="10" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="20" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 's3',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <path d="M14 14l-6 6 6 6M26 14l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 10l-4 20" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 's4',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
        <rect x="6" y="10" width="28" height="20" rx="3" />
        <circle cx="20" cy="20" r="5" />
        <path d="M20 15v2M20 23v2M15 20h2M23 20h2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Services() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          <p className="reveal text-[var(--g)] text-xs font-semibold tracking-[0.14em] uppercase mb-3">
            {t('label')}
          </p>
          <h2
            className="reveal d1 font-black text-white leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            {t('heading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc, i) => (
            <div
              key={svc.key}
              className={`reveal d${i + 1} group relative rounded-2xl border p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--g-border)] cursor-default`}
              style={{ borderColor: 'var(--b)', background: 'var(--surface)' }}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(34,197,94,0.08) 0%, transparent 65%)' }}
                aria-hidden
              />

              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl scale-x-0 group-hover:scale-x-100 transition-transform duration-350 origin-left"
                style={{ background: 'linear-gradient(90deg, var(--g), transparent)' }}
                aria-hidden
              />

              {/* Number */}
              <span
                className="absolute top-4 right-5 font-black text-5xl leading-none select-none"
                style={{ color: 'rgba(255,255,255,0.03)' }}
                aria-hidden
              >
                0{i + 1}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 mb-5 text-[var(--g)]">{svc.icon}</div>

              <h3 className="font-bold text-white text-base mb-2">
                {t(`${svc.key}_title` as 's1_title' | 's2_title' | 's3_title' | 's4_title')}
              </h3>
              <p className="text-[var(--text-sub)] text-sm leading-relaxed">
                {t(`${svc.key}_desc` as 's1_desc' | 's2_desc' | 's3_desc' | 's4_desc')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
