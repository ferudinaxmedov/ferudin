'use client';

import { useTranslations } from 'next-intl';

const projects = [
  {
    title: 'Lumière',
    category: 'E-Commerce · Luxury Fashion',
    desc: 'Full e-commerce redesign & development',
    gradient: 'linear-gradient(135deg, #141428 0%, #1e2a4a 60%, #0f3460 100%)',
    span: 'col-span-1 lg:col-span-2',
    aspect: 'aspect-[16/9]',
  },
  {
    title: 'Meridian',
    category: 'SaaS · Analytics',
    desc: 'Dashboard design & React development',
    gradient: 'linear-gradient(135deg, #1a0f28 0%, #2d1b4e 100%)',
    span: 'col-span-1',
    aspect: 'aspect-square',
  },
  {
    title: 'Solara',
    category: 'Branding · Beauty',
    desc: 'Brand identity & website design',
    gradient: 'linear-gradient(135deg, #0a2010 0%, #1a5c38 100%)',
    span: 'col-span-1',
    aspect: 'aspect-[4/3]',
  },
  {
    title: 'Arcane',
    category: 'Portfolio · Creative',
    desc: 'Portfolio site & brand direction',
    gradient: 'linear-gradient(135deg, #241408 0%, #5c3d1e 100%)',
    span: 'col-span-1',
    aspect: 'aspect-[4/3]',
  },
];

export default function Work() {
  const t = useTranslations('work');

  return (
    <section id="work" className="py-28 px-6 relative">
      {/* Section bg glow */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px opacity-40"
        style={{ background: 'linear-gradient(90deg, transparent, var(--g), transparent)' }}
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
            className="reveal d2 flex items-center gap-2 px-5 py-2.5 border rounded-full text-sm font-semibold text-white/60 hover:text-[var(--g)] hover:border-[var(--g-border)] transition-all duration-200"
            style={{ borderColor: 'var(--b)' }}
          >
            {t('view_all')}
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
              <path d="M2 6.5h9M7 3l4 3.5L7 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <div
              key={p.title}
              className={`reveal d${Math.min(i + 1, 4)} group relative rounded-2xl overflow-hidden cursor-pointer ${p.span} ${p.aspect}`}
              style={{ background: p.gradient }}
              tabIndex={0}
              role="button"
              aria-label={`${p.title} — ${p.category}`}
            >
              {/* Texture */}
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, transparent, transparent 18px, rgba(255,255,255,0.03) 18px, rgba(255,255,255,0.03) 19px)',
                }}
                aria-hidden
              />

              {/* Zoom bg */}
              <div
                className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"
                style={{ background: p.gradient }}
                aria-hidden
              />

              {/* Overlay */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  background:
                    'linear-gradient(to top, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.1) 60%, transparent 100%)',
                }}
              >
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-[var(--g)] text-[10px] font-semibold tracking-[0.13em] uppercase mb-1.5">
                    {p.category}
                  </p>
                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{p.title}</h3>
                  <p className="text-white/40 text-xs">{p.desc}</p>
                </div>
              </div>

              {/* Arrow */}
              <div
                className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-250"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6h8M6.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
