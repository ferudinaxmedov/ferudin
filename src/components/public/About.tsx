'use client';

import { useTranslations } from 'next-intl';

const stack = ['Figma', 'React', 'Next.js', 'TypeScript', 'Tailwind', 'Framer Motion', 'Supabase', 'Vercel', 'Claude AI'];

export default function About() {
  const t = useTranslations('about');

  return (
    <section id="about" className="relative py-24 md:py-32 px-5 scroll-mt-10">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-center">
        {/* Photo */}
        <div className="reveal relative mx-auto w-full max-w-[400px]">
          <div className="glass glass-strong rounded-[32px] p-3">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/ferudin-about.jpg"
                alt="Ferudin Ahmedov"
                width={800}
                height={1000}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
              <div aria-hidden className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,6,12,0.6), transparent 45%)' }} />
              <span className="glass absolute left-3 bottom-3 inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold">
                <span className="live-dot" />
                {t('badge_location')}
              </span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div>
          <p className="reveal eyebrow mb-3">{t('label')}</p>
          <h2 className="reveal d1 font-extrabold tracking-tight leading-[1.05] mb-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)' }}>
            {t('heading')}
          </h2>
          <p className="reveal d2 text-[var(--ink-2)] text-lg leading-relaxed mb-8 max-w-[620px]">{t('bio')}</p>

          <div className="reveal d3 grid grid-cols-3 gap-3 mb-8 max-w-[560px]">
            {[
              { n: '1+', l: t('years') },
              { n: '4', l: t('projects') },
              { n: '3', l: t('langs') },
            ].map(s => (
              <div key={s.l} className="glass rounded-2xl px-4 py-4">
                <div className="text-3xl font-extrabold leading-none grad-text">{s.n}</div>
                <div className="text-[12px] font-semibold text-[var(--ink-3)] mt-2 leading-snug">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="reveal d4">
            <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[var(--ink-3)] mb-3">{t('stack')}</p>
            <div className="flex flex-wrap gap-2">
              {stack.map(s => (
                <span key={s} className="glass rounded-full px-4 py-2 text-[13px] font-semibold">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
