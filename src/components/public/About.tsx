'use client';

import { useTranslations } from 'next-intl';

const tools = [
  { name: 'Figma', color: '#F24E1E' },
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'TypeScript', color: '#3178C6' },
  { name: 'Tailwind', color: '#06B6D4' },
  { name: 'Framer', color: '#0055FF' },
  { name: 'Supabase', color: '#3ECF8E' },
  { name: 'Vercel', color: '#ffffff' },
];

export default function About() {
  const t = useTranslations('about');
  const toolsLabel = useTranslations()('tools');

  return (
    <section id="about" className="py-28 px-6 relative overflow-hidden">
      {/* Bg glow */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 rounded-full animate-glow"
        style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — Visual */}
          <div className="reveal relative order-2 lg:order-1">
            <div
              className="relative rounded-3xl border overflow-hidden p-8"
              style={{ borderColor: 'var(--b)', background: 'var(--surface)' }}
            >
              {/* Top glow */}
              <div
                className="absolute top-0 left-0 right-0 h-32 opacity-40"
                style={{ background: 'linear-gradient(to bottom, rgba(34,197,94,0.08), transparent)' }}
                aria-hidden
              />

              {/* Big letter */}
              <div className="relative z-10 mb-8 flex items-center justify-center h-48">
                <span
                  className="font-black select-none"
                  style={{
                    fontSize: 'clamp(100px, 20vw, 180px)',
                    color: 'rgba(34,197,94,0.06)',
                    lineHeight: 1,
                    letterSpacing: '-0.05em',
                  }}
                  aria-hidden
                >
                  F
                </span>
              </div>

              {/* Stats */}
              <div
                className="relative z-10 grid grid-cols-3 border-t"
                style={{ borderColor: 'var(--b)' }}
              >
                {[
                  { n: '6+', l: t('years') },
                  { n: '48+', l: t('projects') },
                  { n: '30+', l: t('clients') },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className={`flex flex-col items-center py-5 ${i < 2 ? 'border-r' : ''}`}
                    style={{ borderColor: 'var(--b)' }}
                  >
                    <span className="font-black text-2xl" style={{ color: 'var(--g)' }}>{s.n}</span>
                    <span className="text-[var(--text-sub)] text-[11px] mt-1 text-center">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Text */}
          <div className="order-1 lg:order-2">
            <p className="reveal text-[var(--g)] text-xs font-semibold tracking-[0.14em] uppercase mb-4">
              {t('label')}
            </p>
            <h2
              className="reveal d1 font-black text-white leading-tight mb-6"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
            >
              {t('heading')}
            </h2>

            <div className="reveal d2 w-10 h-[2px] mb-6" style={{ background: 'var(--g)' }} aria-hidden />

            <p className="reveal d2 text-[var(--text-sub)] text-base leading-relaxed mb-8">
              {t('bio')}
            </p>

            {/* Skills */}
            <div className="reveal d3">
              <p className="text-[var(--text-sub)] text-xs tracking-widest uppercase mb-4">
                {toolsLabel}
              </p>
              <div className="flex flex-wrap gap-2">
                {tools.map(tool => (
                  <span
                    key={tool.name}
                    className="px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 cursor-default"
                    style={{
                      borderColor: 'var(--b)',
                      background: 'var(--surface)',
                      color: tool.color,
                    }}
                  >
                    {tool.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
