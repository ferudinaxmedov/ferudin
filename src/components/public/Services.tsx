'use client';

import { useTranslations } from 'next-intl';

const services = [
  {
    key: 'web_design',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        <circle cx="9" cy="8" r="1.5" />
        <path d="M13 10l2.5-2.5 3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'web_dev',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: 'branding',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'ui_ux',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function Services() {
  const t = useTranslations('services');

  return (
    <section id="services" className="py-28 px-6 relative">
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
              className={`reveal d${i + 1} group relative rounded-2xl border p-6 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--g-border)] cursor-default`}
              style={{ borderColor: 'var(--b)', background: 'var(--surface)' }}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"
                style={{ background: 'radial-gradient(ellipse at top left, rgba(34,197,94,0.07) 0%, transparent 70%)' }}
                aria-hidden
              />

              {/* Arrow */}
              <div
                className="absolute top-5 right-5 w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0"
                style={{ borderColor: 'var(--g-border)', color: 'var(--g)' }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Icon */}
              <div
                className="w-10 h-10 mb-4 text-[var(--g)]"
              >
                {svc.icon}
              </div>

              <h3 className="font-bold text-white text-base mb-2">
                {t(svc.key as 'web_design' | 'web_dev' | 'branding' | 'ui_ux')}
              </h3>
              <p className="text-[var(--text-sub)] text-sm leading-relaxed">
                {t(`${svc.key}_desc` as 'web_design_desc' | 'web_dev_desc' | 'branding_desc' | 'ui_ux_desc')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
