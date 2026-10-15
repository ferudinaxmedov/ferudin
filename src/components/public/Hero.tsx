'use client';

import { useTranslations } from 'next-intl';

const sites = [
  { label: 'dentaflow.uz', url: 'https://dentaflow.uz', color: '#38bdf8', pos: 'top-[6%] -left-[4%] sm:-left-[10%]', delay: '0s' },
  { label: 'seedbee.uz', url: 'https://seedbee.uz', color: '#7c9cff', pos: 'top-[34%] -right-[4%] sm:-right-[12%]', delay: '-1.5s' },
  { label: 'skyplus.uz', url: 'https://skyplus.uz', color: '#34d399', pos: 'bottom-[22%] -left-[6%] sm:-left-[14%]', delay: '-3s' },
  { label: 'men-kimman.uz', url: 'https://men-kimman.uz', color: '#f472b6', pos: 'bottom-[2%] right-[2%] sm:right-[-4%]', delay: '-4.5s' },
];

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section id="home" className="relative min-h-[min(100svh,980px)] flex items-center pt-28 pb-20 px-5">
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-14 lg:gap-8 items-center">
        {/* Text */}
        <div className="flex flex-col items-start">
          <div className="reveal flex flex-wrap items-center gap-2.5 mb-7">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide">
              <span className="live-dot" />
              {t('badge_exp')}
            </span>
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-[var(--a3)]">
              {t('badge_vibe')}
            </span>
          </div>

          <p className="reveal d1 text-[var(--ink-2)] text-lg mb-1">{t('greeting')}</p>
          <h1
            className="reveal d1 grad-text font-extrabold leading-[0.95] tracking-[-0.04em] mb-5"
            style={{ fontSize: 'clamp(3.6rem, 11vw, 7.5rem)' }}
          >
            Ferudin
          </h1>
          <p className="reveal d2 text-xs font-bold tracking-[0.16em] uppercase text-[var(--ink-3)] mb-5">{t('role')}</p>
          <p className="reveal d2 text-2xl md:text-3xl font-semibold text-white/90 leading-snug mb-4 max-w-[560px]">{t('tagline')}</p>
          <p className="reveal d3 text-[var(--ink-2)] text-base md:text-lg leading-relaxed mb-9 max-w-[500px]">{t('sub')}</p>

          <div className="reveal d3 flex flex-wrap items-center gap-3 mb-10">
            <a href="#work" className="btn btn-primary">
              {t('cta_work')}
              <Arrow />
            </a>
            <a href="#contact" className="btn btn-glass glass">
              {t('cta_contact')}
            </a>
          </div>

          <div className="reveal d4 flex flex-wrap gap-3">
            {[
              { n: '4', l: t('stat_projects') },
              { n: '3', l: t('stat_langs') },
              { n: '100%', l: t('stat_quality') },
            ].map(s => (
              <div key={s.l} className="glass rounded-2xl px-5 py-3 min-w-[104px]">
                <div className="text-2xl font-extrabold leading-none">{s.n}</div>
                <div className="text-[11px] font-semibold text-[var(--ink-3)] mt-1.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Liquid orb visual */}
        <div className="reveal d2 relative mx-auto w-[min(86vw,420px)] aspect-[0.92]">
          <div className="goo absolute inset-0 opacity-90" aria-hidden>
            <span className="blob b1" />
            <span className="blob b2" />
            <span className="blob b3" />
          </div>

          <div className="absolute inset-[9%] morph glass glass-strong overflow-hidden floaty" style={{ animationDuration: '9s' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ferudin-portrait.webp"
              alt="Ferudin Ahmedov"
              width={600}
              height={600}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: '50% 30%' }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 70% at 30% -10%, rgba(255,255,255,0.35), transparent 55%), linear-gradient(to top, rgba(5,6,12,0.55), transparent 45%)',
              }}
            />
          </div>

          {sites.map(s => (
            <a
              key={s.label}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`floaty glass spot sheen absolute ${s.pos} z-10 inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-[12px] sm:text-[13px] font-bold`}
              style={{ animationDelay: s.delay, ['--spot' as string]: `${s.color}40`, ['--spot-strong' as string]: s.color }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 12px ${s.color}` }} />
              {s.label}
            </a>
          ))}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[var(--ink-3)]" aria-hidden>
        <span className="text-[10px] font-bold tracking-[0.18em] uppercase">{t('scroll')}</span>
        <div className="w-px h-9 bg-gradient-to-b from-[var(--a1)] to-transparent" />
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
