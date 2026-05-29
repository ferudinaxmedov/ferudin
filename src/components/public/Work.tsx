'use client';

import { useTranslations } from 'next-intl';

export default function Work() {
  const t = useTranslations('work');

  const projects = [
    {
      title: 'DentaFlow',
      url: 'https://dentaflow.uz',
      category: t('dentaflow_cat'),
      desc: t('dentaflow_desc'),
      gradient: 'linear-gradient(135deg, #0a1628 0%, #0d2a4a 50%, #0a3d6b 100%)',
      accent: '#0ea5e9',
      span: 'col-span-1 md:col-span-2',
      aspect: 'aspect-video',
      label: 'dentaflow.uz',
    },
    {
      title: 'HamidaStom',
      url: 'https://hamidastom.uz',
      category: t('hamidastom_cat'),
      desc: t('hamidastom_desc'),
      gradient: 'linear-gradient(135deg, #0d1f12 0%, #0f3320 100%)',
      accent: '#22c55e',
      span: 'col-span-1',
      aspect: 'aspect-square',
      label: 'hamidastom.uz',
    },
    {
      title: t('p3_title'),
      url: '#contact',
      category: t('p3_cat'),
      desc: t('p3_desc'),
      gradient: 'linear-gradient(135deg, #1a0f28 0%, #2d1b4e 100%)',
      accent: '#a855f7',
      span: 'col-span-1',
      aspect: 'aspect-square',
      label: t('p3_label'),
    },
  ];

  return (
    <section id="work" className="py-28 px-6 relative">
      {/* Section top line */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.25), transparent)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div>
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
          <a
            href="#contact"
            className="reveal d2 flex items-center gap-2 px-5 py-2.5 border rounded-full text-sm font-semibold text-white/50 hover:text-[var(--g)] hover:border-[var(--g-border)] transition-all duration-200"
            style={{ borderColor: 'var(--b)' }}
          >
            {t('view_all')}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M2 6.5h9M7 3l4 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <a
              key={p.title}
              href={p.url}
              target={p.url.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`reveal d${i + 1} group relative rounded-2xl overflow-hidden cursor-pointer ${p.span} ${p.aspect}`}
              style={{ background: p.gradient }}
              aria-label={`${p.title} — ${p.category}`}
            >
              {/* Texture */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg,transparent,transparent 16px,rgba(255,255,255,0.025) 16px,rgba(255,255,255,0.025) 17px)',
                }}
                aria-hidden
              />

              {/* Zoom */}
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.05]"
                style={{ background: p.gradient }}
                aria-hidden
              />

              {/* Accent glow on hover */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse at center, ${p.accent}18 0%, transparent 70%)` }}
                aria-hidden
              />

              {/* URL badge */}
              <div className="absolute top-4 left-4">
                <span
                  className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase border"
                  style={{
                    borderColor: `${p.accent}40`,
                    background: `${p.accent}15`,
                    color: p.accent,
                  }}
                >
                  {p.label}
                </span>
              </div>

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.05) 55%, transparent 100%)' }}
              >
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[10px] font-semibold tracking-[0.13em] uppercase mb-2" style={{ color: p.accent }}>
                    {p.category}
                  </p>
                  <h3 className="text-white font-black text-xl leading-tight mb-1">{p.title}</h3>
                  <p className="text-white/40 text-xs">{p.desc}</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-250">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
